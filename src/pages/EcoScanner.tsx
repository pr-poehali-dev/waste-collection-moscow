import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type ScanStatus = 'idle' | 'scanning' | 'loading' | 'result' | 'error';

type VerdictType = 'recyclable' | 'trash' | 'special' | 'textile' | 'partial';

interface ScanResult {
  status: 'success' | 'partial' | 'error';
  error_type?: string;
  message?: string;
  code?: number;
  material_code?: string;
  material_name?: string;
  examples?: string;
  verdict?: VerdictType;
  instruction?: string;
  container?: string;
  icon?: string;
  confidence?: string;
  found_symbol?: boolean;
}

const SCAN_LABEL_URL = 'https://functions.poehali.dev/568abbff-eb71-4224-a344-213c46f0ceee';

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
  partial: {
    label: 'Требует уточнения',
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    icon: 'HelpCircle',
  },
};

function ScannerViewfinder({ scanning }: { scanning: boolean }) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="w-full h-full bg-black/10" />
      </div>
      {/* Animated corners */}
      <div
        className={`absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-lg transition-all ${scanning ? 'animate-pulse' : ''}`}
      />
      <div
        className={`absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-lg transition-all ${scanning ? 'animate-pulse' : ''}`}
      />
      <div
        className={`absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-lg transition-all ${scanning ? 'animate-pulse' : ''}`}
      />
      <div
        className={`absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-lg transition-all ${scanning ? 'animate-pulse' : ''}`}
      />
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {scanning ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <span className="text-xs text-primary font-medium">Анализирую...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-50">
            <Icon name="ScanLine" size={40} className="text-primary" />
          </div>
        )}
      </div>
      {/* Scan line animation */}
      {scanning && (
        <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-primary/60 animate-bounce" />
      )}
    </div>
  );
}

function ResultCard({
  result,
  onReset,
  onShowMap,
}: {
  result: ScanResult;
  onReset: () => void;
  onShowMap: () => void;
}) {
  if (result.status === 'error') {
    const errorIcons: Record<string, string> = {
      dark: 'Sun',
      blurry: 'Focus',
      not_found: 'SearchX',
    };
    const icon = errorIcons[result.error_type || ''] || 'AlertCircle';

    return (
      <Card className="p-6 border-2 border-orange-200 bg-orange-50 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={32} className="text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-orange-800 mb-2">Не удалось распознать</h3>
          <p className="text-orange-700 text-sm leading-relaxed">{result.message}</p>
        </div>
        <Button onClick={onReset} className="w-full gap-2">
          <Icon name="ScanLine" size={18} />
          Попробовать снова
        </Button>
      </Card>
    );
  }

  if (result.status === 'partial') {
    return (
      <Card className="p-6 border-2 border-amber-200 bg-amber-50 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="HelpCircle" size={32} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-amber-800 mb-2">
            {result.found_symbol ? 'Символ найден, код не определён' : 'Не удалось определить'}
          </h3>
          <p className="text-amber-700 text-sm leading-relaxed">{result.message}</p>
        </div>
        <Button onClick={onReset} className="w-full gap-2">
          <Icon name="ScanLine" size={18} />
          Сканировать ещё
        </Button>
      </Card>
    );
  }

  const verdict = result.verdict || 'trash';
  const cfg = verdictConfig[verdict];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header card */}
      <Card className={`p-5 border-2 ${cfg.bg}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${verdict === 'recyclable' ? 'bg-emerald-100' : verdict === 'textile' ? 'bg-blue-100' : verdict === 'special' ? 'bg-amber-100' : 'bg-gray-100'}`}>
            <Icon name={cfg.icon as Parameters<typeof Icon>[0]['name']} size={28} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-xs font-mono font-bold">
                {result.material_code} · {result.code}
              </Badge>
              {result.confidence === 'high' && (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                  уверенно
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-foreground text-lg leading-tight">
              {result.material_name}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{result.examples}</p>
          </div>
        </div>
      </Card>

      {/* Verdict card */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Info" size={16} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Что делать</span>
        </div>
        <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${cfg.bg} mb-4`}>
          <Icon name={cfg.icon as Parameters<typeof Icon>[0]['name']} size={20} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
          <div>
            <p className={`font-semibold ${cfg.color} mb-1`}>{cfg.label}</p>
            <p className="text-sm text-foreground leading-relaxed">{result.instruction}</p>
          </div>
        </div>
        {result.container && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} />
            <span>{result.container}</span>
          </div>
        )}
      </Card>

      {/* Action buttons */}
      <div className="space-y-3">
        {(verdict === 'recyclable' || verdict === 'textile') && (
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
  const [result, setResult] = useState<ScanResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const scanImage = useCallback(async (file: File) => {
    setStatus('loading');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);

      const base64 = dataUrl.split(',')[1];
      const mime = file.type || 'image/jpeg';

      const response = await fetch(SCAN_LABEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mime_type: mime }),
      });

      const data: ScanResult = await response.json();
      setResult(data);
      setStatus('result');
    };

    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatus('scanning');
      setTimeout(() => scanImage(file), 500);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleShowMap = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 -ml-2">
              <Icon name="ArrowLeft" size={18} />
              Назад
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Icon name="ScanLine" className="text-white" size={16} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">Эко-сканер</h1>
                <p className="text-xs text-muted-foreground">Распознавание маркировки</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-md">
        {status !== 'result' && (
          <>
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Наведи камеру на значок
              </h2>
              <p className="text-muted-foreground text-sm">
                Сканируй упаковку и узнай, как её утилизировать
              </p>
            </div>

            {/* Viewfinder */}
            <div className="mb-6">
              {previewUrl ? (
                <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border-4 border-primary/30">
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  {status === 'loading' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <ScannerViewfinder scanning={status === 'scanning'} />
              )}
            </div>

            {/* Hint */}
            <p className="text-center text-sm text-muted-foreground mb-8">
              <Icon name="Info" size={14} className="inline mr-1 mb-0.5" />
              Ищем петлю Мёбиуса и цифры
            </p>

            {/* Main CTA */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={status === 'loading' || status === 'scanning'}
                className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="Camera" size={32} className="text-white" />
              </button>
              <span className="text-sm font-medium text-foreground">Сделать фото</span>
              <p className="text-xs text-muted-foreground -mt-2">или выбрать из галереи</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Tips */}
            <div className="mt-10 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center mb-4">
                Советы для лучшего распознавания
              </p>
              {[
                { icon: 'Sun', text: 'Хорошее освещение — держи у окна или включи свет' },
                { icon: 'ZoomIn', text: 'Фотографируй крупно — значок должен занимать весь кадр' },
                { icon: 'RotateCcw', text: 'Маркировка обычно на дне или боку упаковки' },
              ].map((tip) => (
                <div key={tip.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Icon name={tip.icon as Parameters<typeof Icon>[0]['name']} size={14} className="text-primary" />
                  </div>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>

            {/* Codes reference */}
            <Card className="mt-8 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Быстрый справочник кодов
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { code: '1 PET', desc: 'Бутылки', verdict: 'recyclable' },
                  { code: '2 HDPE', desc: 'Флаконы', verdict: 'recyclable' },
                  { code: '3 PVC', desc: 'Плёнка', verdict: 'special' },
                  { code: '4 LDPE', desc: 'Пакеты', verdict: 'recyclable' },
                  { code: '5 PP', desc: 'Контейнеры', verdict: 'recyclable' },
                  { code: '6 PS', desc: 'Пенопласт', verdict: 'trash' },
                  { code: '7 OTHER', desc: 'Другое', verdict: 'trash' },
                  { code: '90 C/PAP', desc: 'Тетрапак', verdict: 'recyclable' },
                ].map((item) => (
                  <div key={item.code} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${item.verdict === 'recyclable' ? 'bg-emerald-500' : item.verdict === 'special' ? 'bg-amber-500' : 'bg-gray-400'}`}
                    />
                    <span className="font-mono font-bold text-foreground">{item.code}</span>
                    <span className="text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Result screen */}
        {status === 'result' && result && (
          <>
            <div className="text-center mb-6">
              {result.status === 'success' ? (
                <>
                  <Badge className="mb-3" variant="secondary">
                    <Icon name="CheckCircle" size={12} className="mr-1" />
                    Маркировка распознана
                  </Badge>
                  <h2 className="text-2xl font-bold text-foreground">
                    Найдена маркировка: {result.material_code} · {result.code}
                  </h2>
                </>
              ) : (
                <h2 className="text-2xl font-bold text-foreground">Результат сканирования</h2>
              )}
            </div>

            {previewUrl && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto mb-6 border-4 border-muted">
                <img src={previewUrl} alt="scanned" className="w-full h-full object-cover" />
              </div>
            )}

            <ResultCard result={result} onReset={handleReset} onShowMap={handleShowMap} />
          </>
        )}
      </div>
    </div>
  );
}