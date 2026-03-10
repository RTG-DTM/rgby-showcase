from app.models.schemas import RGBYVector


def generate_hex_signature(vector: RGBYVector) -> str:
    r_hex = int(min(6, max(0, vector.R)) * 42.5)
    g_hex = int(min(6, max(0, vector.G)) * 42.5)
    b_hex = int(min(6, max(0, vector.B)) * 42.5)
    y_hex = int(min(6, max(0, vector.Y)) * 42.5)
    return f"0x{r_hex:02X}{g_hex:02X}{b_hex:02X}{y_hex:02X}"
