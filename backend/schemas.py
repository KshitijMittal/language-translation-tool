from pydantic import BaseModel, Field, field_validator


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    target: str = Field(..., min_length=2, max_length=10, pattern=r'^[a-zA-Z-]+$')
    source: str | None = Field(None, min_length=2, max_length=10, pattern=r'^[a-zA-Z-]+$')

    @field_validator('text')
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError('text must not be blank')
        return stripped


class TranslateResponse(BaseModel):
    translatedText: str
    detectedLanguage: str | None = None


class ErrorResponse(BaseModel):
    error: str


class LanguagesResponse(BaseModel):
    languages: dict[str, str]


class HealthResponse(BaseModel):
    status: str
    version: str
