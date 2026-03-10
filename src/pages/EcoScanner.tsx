import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { createWorker } from 'tesseract.js';

type ScanStatus = 'idle' | 'loading' | 'result' | 'error';
type VerdictType = 'recyclable' | 'trash' | 'special' | 'textile';

interface MaterialInfo {
  code: number;
  material_code: string;
  material_name: string;
  examples: string;
  verdict: VerdictType;
  instruction: string;
  container: string;
}

const MATERIALS: MaterialInfo[] = [
  {
    code: 1,
    material_code: 'PET / PETE',
    material_name: 'Полиэтилентерефталат',
    examples: 'Бутылки для воды, газировки, масла',
    verdict: 'recyclable',
    instruction: 'Сдай в пункт приёма. Перед сдачей сполосни и сомни бутылку.',
    container: 'Синий контейнер для пластика',
  },
  {
    code: 2,
    material_code: 'HDPE / PE-HD',
    material_name: 'Полиэтилен высокой плотности',
    examples: 'Канистры, флаконы шампуней, пакеты из супермаркета',
    verdict: 'recyclable',
    instruction: 'Хорошо перерабатывается. Сполосни и сдай в пункт приёма.',
    container: 'Синий контейнер для пластика',
  },
  {
    code: 3,
    material_code: 'PVC / V',
    material_name: 'Поливинилхлорид',
    examples: 'Трубы, плёнки, оконные профили',
    verdict: 'special',
    instruction: 'Не бросай в обычный мусор — выделяет токсины. Ищи специальный пункт приёма ПВХ.',
    container: 'Специализированный пункт',
  },
  {
    code: 4,
    material_code: 'LDPE / PE-LD',
    material_name: 'Полиэтилен низкой плотности',
    examples: 'Пакеты, плёнки, пузырчатая упаковка',
    verdict: 'recyclable',
    instruction: 'Принимают не везде. Уточни в ближайшем пункте приёма.',
    container: 'Синий контейнер (проверь заранее)',
  },
  {
    code: 5,
    material_code: 'PP',
    material_name: 'Полипропилен',
    examples: 'Контейнеры для еды, крышки, стаканчики',
    verdict: 'recyclable',
    instruction: 'Хорошо перерабатывается. Сполосни и сдай в пункт приёма.',
    container: 'Синий контейнер для пластика',
  },
  {
    code: 6,
    material_code: 'PS',
    material_name: 'Полистирол',
    examples: 'Одноразовые стаканы, лотки, пенопласт',
    verdict: 'trash',
    instruction: 'Перерабатывается редко. Выброси в общий мусор, избегай повторного использования.',
    container: 'Серый контейнер (общий мусор)',
  },
  {
    code: 7,
    material_code: 'OTHER / O',
    material_name: 'Прочие пластики',
    examples: 'Поликарбонат, акрил, смешанные пластики',
    verdict: 'trash',
    instruction: 'Сложный состав — не перерабатывается. Выброси в общий мусор.',
    container: 'Серый контейнер (общий мусор)',
  },
  {
    code: 20,
    material_code: 'PAP / C/PAP',
    material_name: 'Картон / тетрапак',
    examples: 'Коробки, упаковки молока и сока',
    verdict: 'recyclable',
    instruction: 'Расплющи и сдай в пункт приёма макулатуры. Тетрапак — в специальный контейнер.',
    container: 'Жёлтый контейнер для бумаги',
  },
  {
    code: 21,
    material_code: 'PAP',
    material_name: 'Бумага',
    examples: 'Газеты, журналы, офисная бумага',
    verdict: 'recyclable',
    instruction: 'Сдай в пункт приёма макулатуры или в жёлтый контейнер.',
    container: 'Жёлтый контейнер для бумаги',
  },
  {
    code: 40,
    material_code: 'FE',
    material_name: 'Сталь / жесть',
    examples: 'Консервные банки, крышки',
    verdict: 'recyclable',
    instruction: 'Сполосни и сдай в пункт приёма металла или в контейнер.',
    container: 'Контейнер для металла',
  },
  {
    code: 41,
    material_code: 'ALU',
    material_name: 'Алюминий',
    examples: 'Банки от пива и газировки, фольга',
    verdict: 'recyclable',
    instruction: 'Сомни и сдай в пункт приёма. Алюминий ценное сырьё!',
    container: 'Контейнер для металла',
  },
  {
    code: 70,
    material_code: 'GL',
    material_name: 'Бесцветное стекло',
    examples: 'Прозрачные бутылки, банки',
    verdict: 'recyclable',
    instruction: 'Сдай в контейнер для стекла. Крышку сними.',
    container: 'Зелёный контейнер для стекла',
  },
  {
    code: 71,
    material_code: 'GL',
    material_name: 'Зелёное стекло',
    examples: 'Зелёные бутылки',
    verdict: 'recyclable',
    instruction: 'Сдай в контейнер для стекла. Крышку сними.',
    container: 'Зелёный контейнер для стекла',
  },
  {
    code: 72,
    material_code: 'GL',
    material_name: 'Коричневое стекло',
    examples: 'Тёмные бутылки (пиво, лекарства)',
    verdict: 'recyclable',
    instruction: 'Сдай в контейнер для стекла. Крышку сними.',
    container: 'Зелёный контейнер для стекла',
  },
  {
    code: 60,
    material_code: 'TEX',
    material_name: 'Текстиль',
    examples: 'Одежда, ткани, постельное бельё',
    verdict: 'textile',
    instruction: 'Чистую одежду сдай в контейнер для текстиля или отнеси в секонд-хенд.',
    container: 'Контейнер для одежды',
  },
];

const verdictConfig: Record<VerdictType, { label: string; color: string; bg: string; icon: string }> = {
  recyclable: {
    label: 'Можно сдать в переработку',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'Recycle',
  },
  trash: {
    label: 'Выброси в общий мусор',
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    icon: 'Trash2',
  },
  special: {
    label: 'Требует специальной утилизации',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: 'AlertTriangle',
  },
  textile: {
    label: 'Сдай в контейнер для одежды',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: 'Shirt',
  },
};

function detectMaterial(text: string): MaterialInfo | null {
  const clean = text.toUpperCase().replace(/\s+/g, ' ');

  // Search by numeric code (e.g. "01", "1", "05", "5")
  const numMatch = clean.match(/\b0?([1-7]|[2-7][0-9]|[4][0-1]|[6][0]|[7][0-2])\b/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    const found = MATERIALS.find((m) => m.code === num);
    if (found) return found;
  }

  // Search by material code abbreviation
  const codeMap: Record<string, number> = {
    'PETE': 1, 'PET': 1,
    'PE-HD': 2, 'HDPE': 2,
    'PVC': 3,
    'PE-LD': 4, 'LDPE': 4,
    'PP': 5,
    'PS': 6,
    'OTHER': 7,
    'C/PAP': 20, 'PAP': 21,
    'ALU': 41, 'ALUM': 41,
    'GL': 70,
    'TEX': 60,
    'FE': 40,
  };

  for (const [abbr, code] of Object.entries(codeMap)) {
    if (clean.includes(abbr)) {
      const found = MATERIALS.find((m) => m.code === code);
      if (found) return found;
    }
  }

  return null;
}

function ScannerViewfinder({ loading }: { loading: boolean }) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="w-full h-full bg-black/5" />
      </div>
      <div className={`absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-lg ${loading ? 'animate-pulse' : ''}`} />
      <div className={`absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-lg ${loading ? 'animate-pulse' : ''}`} />
      <div className={`absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-lg ${loading ? 'animate-pulse' : ''}`} />
      <div className={`absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-lg ${loading ? 'animate-pulse' : ''}`} />
      <div className="absolute inset-0 flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <span className="text-xs text-primary font-medium">Распознаю...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Icon name="ScanLine" size={40} className="text-primary" />
          </div>
        )}
      </div>
      {loading && (
        <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-primary/60 animate-bounce" />
      )}
    </div>
  );
}

function ResultCard({
  material,
  onReset,
  onShowMap,
}: {
  material: MaterialInfo | null;
  onReset: () => void;
  onShowMap: () => void;
}) {
  if (!material) {
    return (
      <Card className="p-6 border-2 border-orange-200 bg-orange-50">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="SearchX" size={32} className="text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-orange-800 mb-2">Маркировка не найдена</h3>
          <p className="text-orange-700 text-sm leading-relaxed">
            Не удалось распознать знак переработки. Попробуй сфотографировать ближе и чётче,
            или найди цифру в треугольнике из стрелок.
          </p>
        </div>
        <Button onClick={onReset} className="w-full gap-2">
          <Icon name="ScanLine" size={18} />
          Попробовать снова
        </Button>
      </Card>
    );
  }

  const cfg = verdictConfig[material.verdict];

  return (
    <div className="space-y-4">
      <Card className={`p-5 border-2 ${cfg.bg}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${material.verdict === 'recyclable' ? 'bg-emerald-100' : material.verdict === 'textile' ? 'bg-blue-100' : material.verdict === 'special' ? 'bg-amber-100' : 'bg-gray-100'}`}>
            <Icon name={cfg.icon as Parameters<typeof Icon>[0]['name']} size={28} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="secondary" className="text-xs font-mono font-bold mb-1">
              {material.material_code} · {material.code}
            </Badge>
            <h3 className="font-bold text-foreground text-lg leading-tight">{material.material_name}</h3>
            <p className="text-muted-foreground text-sm mt-1">{material.examples}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Info" size={16} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Что делать</span>
        </div>
        <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${cfg.bg} mb-4`}>
          <Icon name={cfg.icon as Parameters<typeof Icon>[0]['name']} size={20} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
          <div>
            <p className={`font-semibold ${cfg.color} mb-1`}>{cfg.label}</p>
            <p className="text-sm text-foreground leading-relaxed">{material.instruction}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="MapPin" size={14} />
          <span>{material.container}</span>
        </div>
      </Card>

      <div className="space-y-3">
        {(material.verdict === 'recyclable' || material.verdict === 'textile') && (
          <Button className="w-full gap-2" size="lg" onClick={onShowMap}>
            <Icon name="Map" size={18} />
            Показать пункты приёма на карте
          </Button>
        )}
        <Button variant="outline" className="w-full gap-2" size="lg" onClick={onReset}>
          <Icon name="ScanLine" size={18} />
          Сканировать ещё
        </Button>
      </div>
    </div>
  );
}

export default function EcoScanner() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [material, setMaterial] = useState<MaterialInfo | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setMaterial(null);
    setPreview(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleShowMap = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const processImage = useCallback(async (file: File) => {
    setStatus('loading');
    setProgress(10);

    const url = URL.createObjectURL(file);
    setPreview(url);

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(10 + m.progress * 80));
          }
        },
      });

      setProgress(30);
      const { data } = await worker.recognize(url);
      await worker.terminate();
      setProgress(95);

      const found = detectMaterial(data.text);
      setMaterial(found);
      setStatus(found ? 'result' : 'error');
    } catch {
      setStatus('error');
      setMaterial(null);
    } finally {
      setProgress(100);
      URL.revokeObjectURL(url);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImage(file);
    },
    [processImage],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="font-bold text-lg leading-tight">Сканер маркировки</h1>
            <p className="text-xs text-muted-foreground">Узнай, как утилизировать упаковку</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Scanner area */}
        {status !== 'result' && (
          <Card className="p-6">
            <ScannerViewfinder loading={status === 'loading'} />

            {status === 'loading' && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Анализирую изображение...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {status === 'idle' && (
              <div className="mt-6 space-y-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Сфотографируй знак переработки — треугольник из стрелок с цифрой
                </p>
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon name="Camera" size={18} />
                  Сфотографировать
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <Icon name="Image" size={18} />
                  Выбрать из галереи
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Preview */}
        {preview && status === 'loading' && (
          <div className="rounded-xl overflow-hidden border">
            <img src={preview} alt="Фото упаковки" className="w-full object-cover max-h-48" />
          </div>
        )}

        {/* Result */}
        {(status === 'result' || status === 'error') && (
          <ResultCard material={material} onReset={handleReset} onShowMap={handleShowMap} />
        )}

        {/* Manual lookup */}
        {status === 'idle' && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-3">Или выбери код вручную</p>
            <div className="grid grid-cols-2 gap-2">
              {MATERIALS.slice(0, 8).map((m) => (
                <button
                  key={m.code}
                  onClick={() => {
                    setMaterial(m);
                    setStatus('result');
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl border bg-white hover:bg-muted transition-colors text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {m.code}
                  </span>
                  <span className="text-xs font-medium leading-tight text-foreground">
                    {m.material_code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hint */}
        {status === 'idle' && (
          <Card className="p-4 bg-muted/50 border-dashed">
            <div className="flex gap-3">
              <Icon name="Lightbulb" size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Фотографируй маркировку при хорошем освещении, держи телефон ровно.
                Лучше всего видны знаки на дне или боку упаковки.
              </p>
            </div>
          </Card>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
