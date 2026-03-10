from app.models.schemas import RGBYVector


def encode_rle(vector: RGBYVector) -> str:
    return f"{vector.R}R{vector.G}G{vector.B}B{vector.Y}Y"
