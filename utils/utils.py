from uuid import UUID
from urllib.parse import urlparse
import re

def is_valid_uuid(value: str) -> bool:
    try:
        UUID(value)
        return True
    except (ValueError, TypeError):
        return False

def is_valid_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return all([result.scheme in ("http", "https"), result.netloc])
    except Exception:
        return False
    
def slugify(value: str) -> str:
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)