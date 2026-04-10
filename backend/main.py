"""
Gerador de Escala de Folgas — CP-SAT (Google OR-Tools)

Execução standalone: python main.py
Servidor API:       uvicorn main:app --port 8000
"""

import json
import math
from datetime import datetime
from typing import Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ortools.sat.python import cp_model
from pydantic import BaseModel


# ════════════════════════════════════════════════════════════════
# API
# ════════════════════════════════════════════════════════════════

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GerarRequest(BaseModel):
    funcionarios: List[str]
    days: List[str]
    quantidadeDiasConsecutivos: int
    prevConsecutive: Dict[str, int]
    diasBloqueados: List[str]  # ex: ["ter", "sex"]


class FolgaItem(BaseModel):
    id_funcionario: str
    data: str


class GerarResponse(BaseModel):
    ok: bool
    folgas: List[FolgaItem]
    error: str | None = None


@app.post("/gerar", response_model=GerarResponse)
def gerar(req: GerarRequest):
    try:
        funcionarios = req.funcionarios
        days = req.days
        max_consec = req.quantidadeDiasConsecutivos
        prev_consecutive = req.prevConsecutive
        dias_bloqueados = req.diasBloqueados

        domingos = identificar_domingos(days)
        bloqueados = identificar_bloqueados(days, dias_bloqueados)
        validar_entrada(funcionarios, days, prev_consecutive, domingos)

        resultado = montar_e_resolver(
            funcionarios, days, max_consec, prev_consecutive, domingos, bloqueados
        )

        if resultado is None:
            return GerarResponse(
                ok=False,
                folgas=[],
                error="Não foi possível encontrar uma solução viável com as restrições atuais.",
            )

        return GerarResponse(ok=True, folgas=resultado["folgas"])

    except ValueError as e:
        return GerarResponse(ok=False, folgas=[], error=str(e))


# ════════════════════════════════════════════════════════════════
# ENTRADA STANDALONE
# ════════════════════════════════════════════════════════════════

INPUT = {
    "funcionarios": ["func_1", "func_2", "func_3", "func_4"],
    "days": [f"2026-04-{str(d).zfill(2)}" for d in range(1, 31)],
    "quantidadeDiasConsecutivos": 6,
    "prevConsecutive": {
        "func_1": 2,
        "func_2": 0,
        "func_3": 4,
        "func_4": 1,
    },
    "diasBloqueados": ["ter", "sex"],
}


# ════════════════════════════════════════════════════════════════
# FUNÇÕES AUXILIARES
# ════════════════════════════════════════════════════════════════

def parse_input(data: dict):
    return (
        data["funcionarios"],
        data["days"],
        data["quantidadeDiasConsecutivos"],
        data["prevConsecutive"],
    )


def identificar_domingos(days: list[str]) -> list[int]:
    domingos = []
    for idx, day_str in enumerate(days):
        dt = datetime.strptime(day_str, "%Y-%m-%d")
        if dt.weekday() == 6:  # domingo
            domingos.append(idx)
    return domingos


# Mapeia weekday() do Python para o nome usado no frontend
_WEEKDAY_TO_DIA = {
    0: "seg", 1: "ter", 2: "qua", 3: "qui", 4: "sex", 5: "sab",
    # domingo (6) não entra aqui — tratado separadamente
}


def identificar_bloqueados(days: list[str], dias_bloqueados: list[str]) -> set[int]:
    """Retorna os índices dos dias cujo dia da semana está bloqueado."""
    bloqueados = set()
    if not dias_bloqueados:
        return bloqueados
    bloq_set = set(dias_bloqueados)
    for idx, day_str in enumerate(days):
        dt = datetime.strptime(day_str, "%Y-%m-%d")
        dia = _WEEKDAY_TO_DIA.get(dt.weekday())
        if dia and dia in bloq_set:
            bloqueados.add(idx)
    return bloqueados


def validar_entrada(funcionarios, days, prev_consecutive, domingos):
    for f in funcionarios:
        if f not in prev_consecutive:
            raise ValueError(f"Funcionário '{f}' sem prevConsecutive definido.")
    if len(domingos) < 1:
        raise ValueError("O período deve conter pelo menos 1 domingo.")
    if len(domingos) > 5:
        raise ValueError("O período não deve conter mais de 5 domingos.")


# ════════════════════════════════════════════════════════════════
# MODELO CP-SAT
# ════════════════════════════════════════════════════════════════

def montar_e_resolver(funcionarios, days, max_consec, prev_consecutive, domingos, bloqueados=None):
    if bloqueados is None:
        bloqueados = set()

    model = cp_model.CpModel()
    num_days = len(days)
    num_funcs = len(funcionarios)

    # ── Variável principal: x[i][d] = 1 → trabalha, 0 → folga ──
    x = {}
    for i, f in enumerate(funcionarios):
        for d in range(num_days):
            x[i, d] = model.new_bool_var(f"x_{f}_{d}")

    # ════════════════════════════════════════════════════════════
    # HARD CONSTRAINTS
    # ════════════════════════════════════════════════════════════

    # ── 0. Dias bloqueados: ninguém pode folgar ──
    for d in bloqueados:
        for i in range(num_funcs):
            model.add(x[i, d] == 1)

    # ── 1. Máx. consecutivos: proibir 8 dias seguidos ──
    for i in range(num_funcs):
        for start in range(num_days - 7):
            model.add(sum(x[i, start + k] for k in range(8)) <= 7)

    # ── 2. Histórico (prevConsecutive) ──
    for i, f in enumerate(funcionarios):
        prev = prev_consecutive[f]
        if prev >= 7:
            model.add(x[i, 0] == 0)
        else:
            remaining = 7 - prev
            if remaining < num_days:
                window = remaining + 1
                if window <= num_days:
                    model.add(
                        sum(x[i, d] for d in range(window)) <= remaining
                    )

    # ── 3. Domingos: exatamente 1 domingo de folga por funcionário ──
    for i in range(num_funcs):
        folgas_domingo = [x[i, d].negated() for d in domingos]
        model.add(sum(folgas_domingo) == 1)

    # Distribuição equilibrada de folgas por domingo
    num_dom = len(domingos)
    floor_val = math.floor(num_funcs / num_dom)
    ceil_val = math.ceil(num_funcs / num_dom)
    for d in domingos:
        folgas_neste_dom = [x[i, d].negated() for i in range(num_funcs)]
        model.add(sum(folgas_neste_dom) >= floor_val)
        model.add(sum(folgas_neste_dom) <= ceil_val)

    # ── 4. Sem folgas consecutivas: x[i][d] + x[i][d+1] >= 1 ──
    for i in range(num_funcs):
        for d in range(num_days - 1):
            model.add(x[i, d] + x[i, d + 1] >= 1)

    # ── 5. Total de folgas: 4 ≤ folgas_i ≤ 5 ──
    folgas_count = {}
    for i in range(num_funcs):
        folgas_i = sum(x[i, d].negated() for d in range(num_days))
        folgas_count[i] = model.new_int_var(4, 5, f"folgas_count_{i}")
        model.add(folgas_count[i] == folgas_i)

    # ════════════════════════════════════════════════════════════
    # SOFT CONSTRAINTS (OBJECTIVE)
    # ════════════════════════════════════════════════════════════

    penalties = []

    # ── Variáveis de trabalho por funcionário ──
    trabalho = {}
    for i in range(num_funcs):
        trabalho[i] = model.new_int_var(0, num_days, f"trabalho_{i}")
        model.add(trabalho[i] == sum(x[i, d] for d in range(num_days)))

    # ── 1. Equilíbrio entre funcionários ──
    max_trabalho = model.new_int_var(0, num_days, "max_trabalho")
    min_trabalho = model.new_int_var(0, num_days, "min_trabalho")
    model.add_max_equality(max_trabalho, [trabalho[i] for i in range(num_funcs)])
    model.add_min_equality(min_trabalho, [trabalho[i] for i in range(num_funcs)])

    diff_trabalho = model.new_int_var(0, num_days, "diff_trabalho")
    model.add(diff_trabalho == max_trabalho - min_trabalho)

    PESO_EQUILIBRIO = 10
    penalties.append(diff_trabalho * PESO_EQUILIBRIO)

    # ── 2. Minimizar folgas (preferir 4 sobre 5) ──
    # Cada folga tem um custo, incentivando o solver a dar apenas 4
    # quando possível, usando a 5ª apenas se necessário para as constraints.
    PESO_FOLGA_EXTRA = 20
    for i in range(num_funcs):
        penalties.append(folgas_count[i] * PESO_FOLGA_EXTRA)

    # ── 3. Balanceamento diário: evitar 2+ folgas no mesmo dia ──
    PESO_DIARIO = 100
    folgas_dia = {}
    max_folgas_dia = model.new_int_var(0, num_funcs, "max_folgas_dia")
    for d in range(num_days):
        folgas_dia[d] = model.new_int_var(0, num_funcs, f"folgas_dia_{d}")
        model.add(folgas_dia[d] == sum(x[i, d].negated() for i in range(num_funcs)))
        excesso = model.new_int_var(0, num_funcs, f"excesso_dia_{d}")
        model.add(excesso >= folgas_dia[d] - 1)
        model.add(excesso >= 0)
        penalties.append(excesso * PESO_DIARIO)
    model.add_max_equality(max_folgas_dia, [folgas_dia[d] for d in range(num_days)])
    penalties.append(max_folgas_dia * PESO_DIARIO)

    # ── 4. Maximizar espaçamento entre folgas ──
    # Penalizar gaps curtos (< 5 dias) entre folgas consecutivas do mesmo
    # funcionário. Quanto menor o gap, maior a penalidade.
    PESO_GAP_CURTO = 25
    for i in range(num_funcs):
        for d1 in range(num_days):
            for d2 in range(d1 + 1, min(d1 + 5, num_days)):
                # Se ambos d1 e d2 são folga → gap curto
                gap = d2 - d1
                both_folga = model.new_bool_var(f"gap_{i}_{d1}_{d2}")
                f1 = x[i, d1].negated()
                f2 = x[i, d2].negated()
                # both_folga = 1 sse d1 e d2 são ambos folga E nenhum dia
                # entre eles é folga (folgas consecutivas do funcionário)
                if gap == 1:
                    # Já proibido pela hard constraint "sem folgas consecutivas"
                    continue
                elif gap == 2:
                    # d1 folga, d1+1 trabalho, d2 folga → gap de 2
                    mid_work = x[i, d1 + 1]
                    model.add_bool_and([f1, mid_work, f2]).only_enforce_if(both_folga)
                    model.add_bool_or([f1.negated(), mid_work.negated(), f2.negated()]).only_enforce_if(both_folga.negated())
                    penalties.append(both_folga * (PESO_GAP_CURTO * 4))  # gap 2: muito ruim
                elif gap == 3:
                    mids = [x[i, d1 + k] for k in range(1, gap)]
                    all_conds = [f1, f2] + mids
                    model.add_bool_and(all_conds).only_enforce_if(both_folga)
                    model.add_bool_or([c.negated() for c in all_conds]).only_enforce_if(both_folga.negated())
                    penalties.append(both_folga * (PESO_GAP_CURTO * 3))  # gap 3: ruim
                elif gap == 4:
                    mids = [x[i, d1 + k] for k in range(1, gap)]
                    all_conds = [f1, f2] + mids
                    model.add_bool_and(all_conds).only_enforce_if(both_folga)
                    model.add_bool_or([c.negated() for c in all_conds]).only_enforce_if(both_folga.negated())
                    penalties.append(both_folga * (PESO_GAP_CURTO * 1))  # gap 4: leve

    # ── 5. Penalizar 7 dias seguidos (janela pura no período) ──
    PESO_7_DIAS = 15
    for i in range(num_funcs):
        for start in range(num_days - 6):
            all_work = model.new_bool_var(f"all7_{i}_{start}")
            model.add(sum(x[i, start + k] for k in range(7)) == 7).only_enforce_if(all_work)
            model.add(sum(x[i, start + k] for k in range(7)) < 7).only_enforce_if(all_work.negated())
            penalties.append(all_work * PESO_7_DIAS)

    # ── 6. Penalizar 7 dias seguidos considerando histórico ──
    PESO_7_HIST = 15
    for i, f in enumerate(funcionarios):
        prev = prev_consecutive[f]
        if prev > 0 and prev < 7:
            window_in_period = 7 - prev
            if window_in_period <= num_days:
                all_work_hist = model.new_bool_var(f"all7hist_{i}")
                model.add(
                    sum(x[i, d] for d in range(window_in_period)) == window_in_period
                ).only_enforce_if(all_work_hist)
                model.add(
                    sum(x[i, d] for d in range(window_in_period)) < window_in_period
                ).only_enforce_if(all_work_hist.negated())
                penalties.append(all_work_hist * PESO_7_HIST)

    # ── 7. Incentivar folga após exatamente 6 dias consecutivos ──
    BONUS_FOLGA_IDEAL = -8
    PESO_FOLGA_CEDO = 2

    for i, f in enumerate(funcionarios):
        prev = prev_consecutive[f]

        for d in range(num_days):
            is_folga = x[i, d].negated()

            if d == 0:
                if prev == max_consec:
                    ideal_here = model.new_bool_var(f"ideal_{i}_{d}")
                    model.add_implication(ideal_here, is_folga)
                    model.add_implication(is_folga, ideal_here)
                    penalties.append(ideal_here * BONUS_FOLGA_IDEAL)
                elif prev < max_consec:
                    cedo = model.new_bool_var(f"cedo_{i}_{d}")
                    model.add_implication(cedo, is_folga)
                    model.add_implication(is_folga, cedo)
                    penalties.append(cedo * PESO_FOLGA_CEDO)
            elif d >= max_consec:
                ideal = model.new_bool_var(f"ideal_{i}_{d}")

                if d >= max_consec + 1:
                    prev_day_folga = x[i, d - max_consec - 1].negated()
                    all_prev_work = model.new_bool_var(f"apw_{i}_{d}")
                    model.add(
                        sum(x[i, d - max_consec + k] for k in range(max_consec)) == max_consec
                    ).only_enforce_if(all_prev_work)
                    model.add(
                        sum(x[i, d - max_consec + k] for k in range(max_consec)) < max_consec
                    ).only_enforce_if(all_prev_work.negated())

                    model.add_bool_and([is_folga, prev_day_folga, all_prev_work]).only_enforce_if(ideal)
                    model.add_bool_or([is_folga.negated(), prev_day_folga.negated(), all_prev_work.negated()]).only_enforce_if(ideal.negated())
                    penalties.append(ideal * BONUS_FOLGA_IDEAL)
                else:
                    all_prev_work = model.new_bool_var(f"apw_{i}_{d}")
                    model.add(
                        sum(x[i, k] for k in range(max_consec)) == max_consec
                    ).only_enforce_if(all_prev_work)
                    model.add(
                        sum(x[i, k] for k in range(max_consec)) < max_consec
                    ).only_enforce_if(all_prev_work.negated())

                    if prev == 0:
                        model.add_bool_and([is_folga, all_prev_work]).only_enforce_if(ideal)
                        model.add_bool_or([is_folga.negated(), all_prev_work.negated()]).only_enforce_if(ideal.negated())
                        penalties.append(ideal * BONUS_FOLGA_IDEAL)
            else:
                effective = prev + d
                if effective == max_consec:
                    ideal_h = model.new_bool_var(f"idealh_{i}_{d}")
                    if d > 0:
                        all_work_before = model.new_bool_var(f"awb_{i}_{d}")
                        model.add(
                            sum(x[i, k] for k in range(d)) == d
                        ).only_enforce_if(all_work_before)
                        model.add(
                            sum(x[i, k] for k in range(d)) < d
                        ).only_enforce_if(all_work_before.negated())
                        model.add_bool_and([is_folga, all_work_before]).only_enforce_if(ideal_h)
                        model.add_bool_or([is_folga.negated(), all_work_before.negated()]).only_enforce_if(ideal_h.negated())
                    else:
                        model.add_implication(ideal_h, is_folga)
                        model.add_implication(is_folga, ideal_h)
                    penalties.append(ideal_h * BONUS_FOLGA_IDEAL)
                elif effective < max_consec:
                    cedo = model.new_bool_var(f"cedo_{i}_{d}")
                    model.add_implication(cedo, is_folga)
                    model.add_implication(is_folga, cedo)
                    penalties.append(cedo * PESO_FOLGA_CEDO)

    # ── Objetivo final ──
    model.minimize(sum(penalties))

    # ════════════════════════════════════════════════════════════
    # SOLVER
    # ════════════════════════════════════════════════════════════
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30
    solver.parameters.num_workers = 8

    status = solver.solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return None

    return gerar_saida(solver, x, funcionarios, days, num_days, domingos, prev_consecutive, max_consec)


# ════════════════════════════════════════════════════════════════
# SAÍDA
# ════════════════════════════════════════════════════════════════

def gerar_saida(solver, x, funcionarios, days, num_days, domingos, prev_consecutive, max_consec):
    folgas = []
    for i, f in enumerate(funcionarios):
        for d in range(num_days):
            if solver.value(x[i, d]) == 0:
                folgas.append({
                    "id_funcionario": f,
                    "data": days[d],
                })

    # Relatório no console (útil para debug)
    print("=" * 60)
    print("RELATÓRIO DA ESCALA")
    print("=" * 60)

    dom_names = [days[d] for d in domingos]
    print(f"\nDomingos no período: {dom_names}")
    print(f"Dias consecutivos máx. desejados: {max_consec}")
    print()

    for i, f in enumerate(funcionarios):
        dias_folga = [days[d] for d in range(num_days) if solver.value(x[i, d]) == 0]
        dias_trabalho_count = num_days - len(dias_folga)
        dom_folga = [days[d] for d in domingos if solver.value(x[i, d]) == 0]

        prev = prev_consecutive[f]
        seq = prev
        max_seq = prev
        seqs = []
        for d in range(num_days):
            if solver.value(x[i, d]) == 1:
                seq += 1
            else:
                if seq > 0:
                    seqs.append(seq)
                max_seq = max(max_seq, seq)
                seq = 0
        if seq > 0:
            seqs.append(seq)
            max_seq = max(max_seq, seq)

        print(f"  {f}:")
        print(f"    prevConsecutive: {prev}")
        print(f"    Folgas ({len(dias_folga)}): {dias_folga}")
        print(f"    Dias trabalhados: {dias_trabalho_count}")
        print(f"    Domingo(s) de folga: {dom_folga}")
        print(f"    Máx. consecutivos trabalhados: {max_seq}")
        print(f"    Sequências de trabalho: {seqs}")
        print()

    # Distribuição diária
    print("  Distribuição diária (trabalhando / total):")
    num_funcs = len(funcionarios)
    for d in range(num_days):
        trabalhando = sum(1 for i in range(num_funcs) if solver.value(x[i, d]) == 1)
        folgando = num_funcs - trabalhando
        marker = " ⚠" if folgando >= 2 else ""
        dt = datetime.strptime(days[d], "%Y-%m-%d")
        dow = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"][dt.weekday()]
        print(f"    {days[d]} ({dow}): {trabalhando}/{num_funcs} trabalhando, {folgando} folga(s){marker}")
    print()

    return {"folgas": folgas}


# ════════════════════════════════════════════════════════════════
# MAIN (standalone)
# ════════════════════════════════════════════════════════════════

def main():
    funcionarios, days, max_consec, prev_consecutive = parse_input(INPUT)
    dias_bloqueados = INPUT.get("diasBloqueados", [])
    domingos = identificar_domingos(days)
    bloqueados = identificar_bloqueados(days, dias_bloqueados)

    print(f"Funcionários: {funcionarios}")
    print(f"Período: {days[0]} a {days[-1]} ({len(days)} dias)")
    print(f"Máx. consecutivos desejados: {max_consec}")
    print(f"Domingos: {[days[d] for d in domingos]}")
    print(f"Dias bloqueados: {dias_bloqueados} -> indices {sorted(bloqueados)}")
    print(f"prevConsecutive: {prev_consecutive}")
    print()

    validar_entrada(funcionarios, days, prev_consecutive, domingos)

    resultado = montar_e_resolver(funcionarios, days, max_consec, prev_consecutive, domingos, bloqueados)

    if resultado is None:
        print("\nNão foi possível encontrar uma solução viável.")
        return

    print("\n" + "=" * 60)
    print("SAÍDA JSON")
    print("=" * 60)
    print(json.dumps(resultado, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
