import hashlib
def hash_ip(ip: str) -> str:
	"""Return a short SHA256 hex prefix for an IP string."""
	if not ip:
		return ""
	return hashlib.sha256(ip.encode("utf-8")).hexdigest()[:32]
