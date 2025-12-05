import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface WasteCategory {
  id: number;
  name: string;
}

interface SuggestPointFormProps {
  categories: WasteCategory[];
  onSuccess?: () => void;
}

export default function SuggestPointForm({ categories, onSuccess }: SuggestPointFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    address: '',
    metro: '',
    hours: '',
    phone: '',
    email: '',
    user_name: '',
    user_contact: '',
    comment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://functions.poehali.dev/59e9bae6-0315-4f6e-9e53-b57495accb0c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category_id: parseInt(formData.category_id)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          category_id: '',
          name: '',
          address: '',
          metro: '',
          hours: '',
          phone: '',
          email: '',
          user_name: '',
          user_contact: '',
          comment: ''
        });
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
          onSuccess?.();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <Icon name="Plus" size={20} className="mr-2" />
        Предложить пункт приёма
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8 p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setIsOpen(false)}
        >
          <Icon name="X" size={20} />
        </Button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Предложить новый пункт приёма</h2>
          <p className="text-muted-foreground">
            Знаете пункт приёма, которого нет в нашей базе? Расскажите нам о нём!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category_id" className="required">
              Категория отходов *
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleChange('category_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название пункта приёма *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Например: ЭкоЦентр на Арбате"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Улица, номер дома"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metro">Ближайшее метро</Label>
              <Input
                id="metro"
                value={formData.metro}
                onChange={(e) => handleChange('metro', e.target.value)}
                placeholder="Например: Арбатская"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Часы работы</Label>
              <Input
                id="hours"
                value={formData.hours}
                onChange={(e) => handleChange('hours', e.target.value)}
                placeholder="Например: 10:00-20:00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Дополнительная информация</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              placeholder="Любая полезная информация: особенности работы, как добраться, что именно принимают..."
              rows={3}
            />
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="font-semibold mb-3">Ваши контакты (опционально)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Оставьте контакты, если хотите получить уведомление о добавлении пункта
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_name">Ваше имя</Label>
                <Input
                  id="user_name"
                  value={formData.user_name}
                  onChange={(e) => handleChange('user_name', e.target.value)}
                  placeholder="Иван Петров"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_contact">Email или телефон</Label>
                <Input
                  id="user_contact"
                  value={formData.user_contact}
                  onChange={(e) => handleChange('user_contact', e.target.value)}
                  placeholder="ivan@example.com"
                />
              </div>
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Icon name="CheckCircle" size={20} className="text-green-600" />
              <p className="text-green-800">
                Спасибо! Ваше предложение принято на рассмотрение.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <Icon name="AlertCircle" size={20} className="text-red-600" />
              <p className="text-red-800">
                Произошла ошибка. Пожалуйста, попробуйте позже.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
