from typing import Iterable

from flask import abort


def require_fields(payload: dict, fields: Iterable[str]) -> None:
    missing = [field for field in fields if field not in payload]
    if missing:
        abort(400, description=f"Missing required fields: {', '.join(missing)}")


def validate_role(role: str) -> bool:
    return role in {"admin", "teacher", "student"}
