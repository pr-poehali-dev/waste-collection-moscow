"""
Эко-сканер маркировки: распознаёт символ переработки и код на фото упаковки.
Принимает base64-изображение, возвращает тип материала и инструкцию по утилизации.
"""

import json
import os
import base64
import re
from openai import OpenAI

MATERIALS_DB = {
    1: {
        "code": "PET",
        "name": "Полиэтилентерефталат",
        "examples": "Пластиковые бутылки для воды и напитков",
        "verdict": "recyclable",
        "instruction": "Сдавай в пластик. Сполосни бутылку, можно не мыть тщательно. Крышку можно оставить.",
        "container": "Контейнер «Пластик»",
        "icon": "bottle",
    },
    2: {
        "code": "HDPE",
        "name": "Полиэтилен высокой плотности",
        "examples": "Флаконы от шампуня, канистры, молочные бутылки",
        "verdict": "recyclable",
        "instruction": "Сдавай в пластик. Твёрдые флаконы хорошо перерабатываются.",
        "container": "Контейнер «Пластик»",
        "icon": "package",
    },
    3: {
        "code": "PVC",
        "name": "Поливинилхлорид",
        "examples": "Плёнка, линолеум, трубы, некоторые упаковки",
        "verdict": "special",
        "instruction": "Сложный пластик — в обычных пунктах не принимают. Сдавай в спецпроекты по сбору ПВХ или выбрасывай в общий мусор.",
        "container": "Специализированные пункты или общий мусор",
        "icon": "alert-triangle",
    },
    4: {
        "code": "LDPE",
        "name": "Полиэтилен низкой плотности",
        "examples": "Пакеты, стрейч-плёнка, мягкая упаковка",
        "verdict": "recyclable",
        "instruction": "Мягкий пластик. Сдавай в пакетоприёмники в супермаркетах или в пункты приёма мягкого пластика.",
        "container": "Пакетоприёмник в магазине",
        "icon": "shopping-bag",
    },
    5: {
        "code": "PP",
        "name": "Полипропилен",
        "examples": "Контейнеры для еды, вёдра, крышки, йогуртовые стаканчики",
        "verdict": "recyclable",
        "instruction": "Сдавай в пластик. Один из лучших для переработки пластиков.",
        "container": "Контейнер «Пластик»",
        "icon": "package",
    },
    6: {
        "code": "PS",
        "name": "Полистирол",
        "examples": "Пенопласт, одноразовые стаканчики, лотки",
        "verdict": "trash",
        "instruction": "Полистирол практически не перерабатывается. Выбрасывай в общий мусор.",
        "container": "Общий мусор",
        "icon": "trash-2",
    },
    7: {
        "code": "OTHER",
        "name": "Смешанный или другой пластик",
        "examples": "Многослойная упаковка, CD-диски, некоторые бутылки",
        "verdict": "trash",
        "instruction": "Смешанный пластик сложно переработать. Выбрасывай в общий мусор.",
        "container": "Общий мусор",
        "icon": "trash-2",
    },
    20: {
        "code": "PAP20",
        "name": "Гофрокартон",
        "examples": "Коробки, транспортная упаковка",
        "verdict": "recyclable",
        "instruction": "Сдавай в макулатуру. Сложи коробку плоско и убери скотч.",
        "container": "Контейнер «Бумага и картон»",
        "icon": "package",
    },
    21: {
        "code": "PAP21",
        "name": "Прочие виды картона",
        "examples": "Картонные коробки, упаковки от яиц",
        "verdict": "recyclable",
        "instruction": "Сдавай в макулатуру.",
        "container": "Контейнер «Бумага и картон»",
        "icon": "package",
    },
    22: {
        "code": "PAP22",
        "name": "Бумага",
        "examples": "Газеты, журналы, офисная бумага",
        "verdict": "recyclable",
        "instruction": "Сдавай в макулатуру. Не мочи и не мни.",
        "container": "Контейнер «Бумага»",
        "icon": "file-text",
    },
    40: {
        "code": "FE40",
        "name": "Сталь",
        "examples": "Консервные банки, крышки от банок",
        "verdict": "recyclable",
        "instruction": "Сдавай в металл. Ополосни банку от остатков еды.",
        "container": "Контейнер «Металл»",
        "icon": "circle",
    },
    41: {
        "code": "ALU41",
        "name": "Алюминий",
        "examples": "Алюминиевые банки, фольга",
        "verdict": "recyclable",
        "instruction": "Сдавай в металл. Смни банку — так занимает меньше места.",
        "container": "Контейнер «Металл»",
        "icon": "circle",
    },
    70: {
        "code": "GL70",
        "name": "Бесцветное стекло",
        "examples": "Прозрачные стеклянные бутылки и банки",
        "verdict": "recyclable",
        "instruction": "Сдавай в стекло. Убери крышку, ополосни.",
        "container": "Контейнер «Стекло»",
        "icon": "wine",
    },
    71: {
        "code": "GL71",
        "name": "Зелёное стекло",
        "examples": "Зелёные бутылки",
        "verdict": "recyclable",
        "instruction": "Сдавай в стекло.",
        "container": "Контейнер «Стекло»",
        "icon": "wine",
    },
    72: {
        "code": "GL72",
        "name": "Коричневое стекло",
        "examples": "Тёмные бутылки от пива, вина",
        "verdict": "recyclable",
        "instruction": "Сдавай в стекло.",
        "container": "Контейнер «Стекло»",
        "icon": "wine",
    },
    90: {
        "code": "C/PAP",
        "name": "Комбинированный материал (бумага + пластик)",
        "examples": "Тетрапак, упаковки от сока и молока",
        "verdict": "recyclable",
        "instruction": "Тетрапак принимают отдельно. Сполосни, сложи и сдай в специальный пункт приёма тетрапака.",
        "container": "Пункт приёма тетрапака",
        "icon": "box",
    },
}

TEXTILE_RANGE = list(range(50, 60))
for code in TEXTILE_RANGE:
    MATERIALS_DB[code] = {
        "code": f"TEX{code}",
        "name": "Текстиль",
        "examples": "Одежда, ткань, постельное бельё",
        "verdict": "textile",
        "instruction": "Сдавай в контейнеры для одежды или в благотворительные фонды.",
        "container": "Контейнер для одежды / благотворительный фонд",
        "icon": "shirt",
    }


def analyze_image_with_gpt(image_base64: str, mime_type: str = "image/jpeg") -> dict:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    prompt = """Examine this image of packaging or a label. Look for the recycling symbol (Möbius loop - triangle made of arrows) and any number inside or next to it.

Return a JSON object with these fields:
- "found_symbol": true/false (did you find the recycling triangle?)
- "found_number": true/false (did you find a number inside or next to the triangle?)
- "code": number or null (the recycling code: 1-7, 20-22, 40-41, 70-72, 90, etc.)
- "confidence": "high"/"medium"/"low" (your confidence in the detection)
- "brightness": "ok"/"dark"/"blurry" (image quality)
- "raw_text": string (any text you see near the recycling symbol)

IMPORTANT: Return ONLY the JSON object, no other text."""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{image_base64}",
                            "detail": "high",
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
        max_tokens=300,
        temperature=0,
    )

    content = response.choices[0].message.content.strip()
    content = re.sub(r"^```json\s*", "", content)
    content = re.sub(r"\s*```$", "", content)
    return json.loads(content)


def build_result(ai_result: dict) -> dict:
    if ai_result.get("brightness") == "dark":
        return {
            "status": "error",
            "error_type": "dark",
            "message": "Слишком темно. Включите вспышку или подойдите к свету.",
        }

    if ai_result.get("brightness") == "blurry":
        return {
            "status": "error",
            "error_type": "blurry",
            "message": "Изображение размыто. Держите телефон ровно и сфотографируйте крупнее.",
        }

    if not ai_result.get("found_symbol"):
        return {
            "status": "error",
            "error_type": "not_found",
            "message": "Не удалось распознать знак переработки. Попробуйте сфотографировать этикетку крупнее или найдите маркировку на дне упаковки.",
        }

    if not ai_result.get("found_number") or ai_result.get("code") is None:
        return {
            "status": "partial",
            "error_type": "no_number",
            "message": "Найден символ вторичной переработки, но без цифры. Обычно это значит, что производитель заявляет о возможности переработки, но тип материала неизвестен. Проверьте информацию на упаковке вручную.",
            "found_symbol": True,
        }

    code = int(ai_result["code"])
    material = MATERIALS_DB.get(code)

    if not material:
        return {
            "status": "partial",
            "error_type": "unknown_code",
            "message": f"Найден код {code}, но он не входит в стандартную базу маркировок. Обратитесь к производителю для уточнения типа материала.",
            "code": code,
            "found_symbol": True,
        }

    return {
        "status": "success",
        "code": code,
        "material_code": material["code"],
        "material_name": material["name"],
        "examples": material["examples"],
        "verdict": material["verdict"],
        "instruction": material["instruction"],
        "container": material["container"],
        "icon": material["icon"],
        "confidence": ai_result.get("confidence", "medium"),
        "raw_text": ai_result.get("raw_text", ""),
    }


def handler(event: dict, context) -> dict:
    """Сканер эко-маркировки: принимает base64-фото, возвращает тип материала и инструкцию по утилизации."""

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "headers": cors_headers,
            "body": json.dumps({"error": "Method not allowed"}),
        }

    body = json.loads(event.get("body") or "{}")
    image_base64 = body.get("image")
    mime_type = body.get("mime_type", "image/jpeg")

    if not image_base64:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "No image provided"}),
        }

    ai_result = analyze_image_with_gpt(image_base64, mime_type)
    result = build_result(ai_result)

    return {
        "statusCode": 200,
        "headers": {**cors_headers, "Content-Type": "application/json"},
        "body": json.dumps(result, ensure_ascii=False),
    }
