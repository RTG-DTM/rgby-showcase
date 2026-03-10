from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="RGX_",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "RGBY.ai Governance Showcase"
    environment: Literal["dev", "test", "prod"] = "dev"
    api_prefix: str = "/api/v1"
    debug: bool = False
    allowed_origins: list[str] = ["*"]
    port: int = Field(default=8000, validation_alias="PORT")
    local_data_dir: Path = Path("./data")
    contradiction_patterns_file: Path = Path("./app/services/contradiction_rules.json")

    # LLM settings
    llm_provider: Literal["openai", "anthropic", "mock"] = "mock"
    openai_api_key: str = Field(default="", validation_alias="OPENAI_API_KEY")
    anthropic_api_key: str = Field(default="", validation_alias="ANTHROPIC_API_KEY")
    llm_model: str = "gpt-4o"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 500


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.local_data_dir.mkdir(parents=True, exist_ok=True)
    return settings
