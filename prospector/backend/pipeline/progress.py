import threading

_lock = threading.Lock()
_progress: dict[int, dict] = {}

PHASES = [
    "BUSCANDO EMPRESAS",
    "COLETANDO INFORMACOES",
    "VALIDANDO SITES",
    "CALCULANDO SCORE",
    "FINALIZANDO",
]


def start(search_id: int, total: int):
    with _lock:
        _progress[search_id] = {
            "phase": PHASES[0],
            "phase_index": 0,
            "found": 0,
            "analyzed": 0,
            "total": total,
            "errors_count": 0,
        }


def update(search_id: int, **kwargs):
    with _lock:
        if search_id in _progress:
            _progress[search_id].update(kwargs)


def set_phase(search_id: int, phase: str):
    idx = PHASES.index(phase) if phase in PHASES else 0
    update(search_id, phase=phase, phase_index=idx)


def increment_error(search_id: int):
    with _lock:
        if search_id in _progress:
            _progress[search_id]["errors_count"] += 1


def get(search_id: int) -> dict | None:
    with _lock:
        return dict(_progress[search_id]) if search_id in _progress else None


def clear(search_id: int):
    with _lock:
        _progress.pop(search_id, None)
