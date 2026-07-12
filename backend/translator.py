import re
import requests
from langdetect import detect as detect_lang

GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single"
CHUNK_BYTES = 1800  # Google Translate handles larger chunks than MyMemory

SUPPORTED_LANGUAGES = {
    "af": "Afrikaans",
    "sq": "Albanian",
    "am": "Amharic",
    "ar": "Arabic",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bn": "Bengali",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "my": "Burmese",
    "ca": "Catalan",
    "ceb": "Cebuano",
    "ny": "Chichewa",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)",
    "co": "Corsican",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "eo": "Esperanto",
    "et": "Estonian",
    "tl": "Filipino",
    "fi": "Finnish",
    "fr": "French",
    "fy": "Frisian",
    "gl": "Galician",
    "ka": "Georgian",
    "de": "German",
    "el": "Greek",
    "gu": "Gujarati",
    "ht": "Haitian Creole",
    "ha": "Hausa",
    "haw": "Hawaiian",
    "he": "Hebrew",
    "hi": "Hindi",
    "hmn": "Hmong",
    "hu": "Hungarian",
    "is": "Icelandic",
    "ig": "Igbo",
    "id": "Indonesian",
    "ga": "Irish",
    "it": "Italian",
    "ja": "Japanese",
    "jv": "Javanese",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "rw": "Kinyarwanda",
    "ko": "Korean",
    "ku": "Kurdish",
    "ky": "Kyrgyz",
    "lo": "Lao",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "lb": "Luxembourgish",
    "mk": "Macedonian",
    "mg": "Malagasy",
    "ms": "Malay",
    "ml": "Malayalam",
    "mt": "Maltese",
    "mi": "Maori",
    "mr": "Marathi",
    "mn": "Mongolian",
    "ne": "Nepali",
    "no": "Norwegian",
    "or": "Odia (Oriya)",
    "ps": "Pashto",
    "fa": "Persian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pa": "Punjabi",
    "ro": "Romanian",
    "ru": "Russian",
    "sm": "Samoan",
    "gd": "Scots Gaelic",
    "sr": "Serbian",
    "st": "Sesotho",
    "sn": "Shona",
    "sd": "Sindhi",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "so": "Somali",
    "es": "Spanish",
    "su": "Sundanese",
    "sw": "Swahili",
    "sv": "Swedish",
    "tg": "Tajik",
    "ta": "Tamil",
    "tt": "Tatar",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "tk": "Turkmen",
    "ug": "Uyghur",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "uz": "Uzbek",
    "vi": "Vietnamese",
    "cy": "Welsh",
    "xh": "Xhosa",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu",
}

# Map Google's language code format to our codes (e.g., zh-CN -> zh-CN is already compatible)
# Note: Google uses "zh-CN" and "zh-TW" which match our format


def fetch_languages() -> dict[str, str]:
    return dict(sorted(SUPPORTED_LANGUAGES.items(), key=lambda x: x[1]))


def _split_text(text: str) -> list[str]:
    """Split text into chunks that fit within CHUNK_BYTES, splitting on boundaries."""
    # First split by paragraphs
    paragraphs = re.split(r"(\n\s*\n)", text)

    chunks: list[str] = []
    current = ""

    for part in paragraphs:
        encoded = current.encode("utf-8")
        part_encoded = part.encode("utf-8")

        if len(encoded) + len(part_encoded) <= CHUNK_BYTES:
            current += part
        else:
            if current:
                chunks.append(current)
            # If the single paragraph itself is too big, split it by sentences
            if len(part_encoded) > CHUNK_BYTES:
                sentences = re.split(r"(?<=[.!?])\s+", part)
                inner = ""
                for sent in sentences:
                    if len(inner.encode("utf-8")) + len(sent.encode("utf-8")) <= CHUNK_BYTES:
                        inner += sent + " "
                    else:
                        if inner:
                            chunks.append(inner.strip())
                        inner = sent + " "
                if inner:
                    current = inner.strip()
                else:
                    current = ""
            else:
                current = part

    if current:
        chunks.append(current.rstrip())

    return [c for c in chunks if c.strip()]


def _translate_chunk(
    text: str,
    target: str,
    source: str,
) -> str:
    """Translate a single chunk via Google Translate API."""
    params = {
        "client": "gtx",
        "sl": source,
        "tl": target,
        "dt": "t",
        "q": text,
    }

    resp = requests.get(GOOGLE_TRANSLATE_URL, params=params, timeout=15)

    if resp.status_code != 200:
        raise Exception(f"Translation API returned status {resp.status_code}")

    data = resp.json()

    # Response format: [[["translated", "original", null, null, N]], null, "detected_lang", ...]
    # The first element is an array of translation segments, each segment is [translated, original, ...]
    try:
        segments = data[0]
        translated = "".join(segment[0] for segment in segments if segment[0])
    except (IndexError, TypeError):
        raise Exception("Could not parse translation response")

    if not translated.strip():
        raise Exception("Empty response from translation API")

    return translated


def translate_text(
    text: str,
    target: str,
    source: str | None = None,
) -> dict:
    auto_detected = False

    if source is None:
        try:
            source = detect_lang(text)
            auto_detected = True
        except Exception:
            source = "en"
            auto_detected = True

    chunks = _split_text(text)

    if len(chunks) <= 1:
        translated = _translate_chunk(text, target, source)
    else:
        translated_parts = []
        for chunk in chunks:
            part = _translate_chunk(chunk, target, source)
            translated_parts.append(part)
        # Join with line breaks that match the original paragraph separation
        translated = "\n\n".join(translated_parts)

    result: dict[str, str] = {"translatedText": translated}
    if auto_detected:
        result["detectedLanguage"] = source

    return result
