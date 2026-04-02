"""Shared rate limiter configuration."""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Per-IP limiter (default key function).
limiter = Limiter(key_func=get_remote_address)

