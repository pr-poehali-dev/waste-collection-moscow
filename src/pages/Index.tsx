import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import MapWidget from '@/components/MapWidget';

const faqs = [
  {
    question: 'Нужно ли сортировать отходы перед сдачей?',
    answer: 'Да, базовая сортировка значительно упрощает переработку. Разделяйте пластик, стекло, бумагу и металл. Батареи, лампы и текстиль сдавайте отдельно в специализированные пункты.'
  },
  {
    question: 'Бесплатно ли сдавать отходы?',
    answer: 'Большинство пунктов приёма принимают отходы бесплатно. Некоторые даже платят за макулатуру, металл и электронику. За крупногабаритные отходы может взиматься символическая плата.'
  },
  {
    question: 'Можно ли сдать старую технику?',
    answer: 'Да! Старую электронику принимают специализированные центры. Многие магазины техники также имеют программы утилизации при покупке нового устройства.'
  },
  {
    question: 'Как часто обновляется информация о пунктах приёма?',
    answer: 'Мы обновляем данные ежемесячно. Перед визитом рекомендуем уточнить график работы по телефону, указанному на карточке пункта приёма.'
  },
  {
    question: 'Принимают ли крупногабаритные отходы?',
    answer: 'Для КГО (мебель, бытовая техника) действуют специальные площадки. Также можно вызвать вывоз через портал mos.ru или управляющую компанию.'
  }
];

interface CollectionPoint {
  id: number;
  name: string;
  address: string;
  metro: string | null;
  latitude: number | null;
  longitude: number | null;
  hours: string | null;
  phone: string | null;
  categories: Array<{
    id: number;
    code: string;
    name: string;
    icon: string;
    color: string;
    description: string;
  }>;
}

interface Category {
  id: number;
  code: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  pointsCount: number;
}

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchPoints();
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    const response = await fetch('https://functions.poehali.dev/853c50af-96f2-4046-80a5-b37a7859b789');
    const data = await response.json();
    setCategories(data.categories);
  };

  const fetchPoints = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category_id', selectedCategory.toString());
    if (searchQuery) params.append('search', searchQuery);
    
    const response = await fetch(`https://functions.poehali.dev/22ec9c51-ea8a-4b82-9fbd-1ba63178de1e?${params}`);
    const data = await response.json();
    setPoints(data.points);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Icon name="Leaf" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ЭкоМосква</h1>
                <p className="text-sm text-muted-foreground">Сортировка отходов для чистого города</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <Button variant="ghost" onClick={() => setActiveTab('map')}>
                <Icon name="MapPin" className="mr-2" size={18} />
                Карта
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('categories')}>
                <Icon name="Grid3x3" className="mr-2" size={18} />
                Категории
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('how-to')}>
                <Icon name="Info" className="mr-2" size={18} />
                Как сдавать
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab('faq')}>
                <Icon name="HelpCircle" className="mr-2" size={18} />
                FAQ
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <Badge className="mb-4" variant="secondary">
              <Icon name="Sparkles" className="mr-1" size={14} />
              Экологичная Москва
            </Badge>
            <h2 className="text-5xl font-bold mb-6 text-foreground">
              Сдавай отходы правильно
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Найди ближайший пункт приёма на интерактивной карте Москвы. 
              Батареи, текстиль, шины, лампы и ГСМ — всё это можно переработать!
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="gap-2" onClick={() => setActiveTab('map')}>
                <Icon name="Map" size={20} />
                Открыть карту
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => setActiveTab('categories')}>
                <Icon name="List" size={20} />
                Категории отходов
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto px-4 py-12">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
          <TabsTrigger value="map" className="gap-2">
            <Icon name="Map" size={16} />
            <span className="hidden sm:inline">Карта</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Icon name="Grid3x3" size={16} />
            <span className="hidden sm:inline">Категории</span>
          </TabsTrigger>
          <TabsTrigger value="how-to" className="gap-2">
            <Icon name="Info" size={16} />
            <span className="hidden sm:inline">Как сдавать</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
            <Icon name="HelpCircle" size={16} />
            <span className="hidden sm:inline">FAQ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="animate-fade-in">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Интерактивная карта пунктов приёма</h3>
              <p className="text-muted-foreground">Выберите категорию отходов или введите адрес для поиска</p>
            </div>

            <div className="mb-6">
              <Input
                placeholder="Поиск по адресу, метро или названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button 
                variant={selectedCategory === null ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Все категории
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="gap-2"
                >
                  <Icon name={cat.icon as any} size={16} />
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="mb-6">
              <MapWidget points={points} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Загрузка...</p>
                </div>
              ) : points.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Пункты приёма не найдены</p>
                </div>
              ) : (
                points.map((point) => (
                  <Card key={point.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${point.categories[0]?.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={point.categories[0]?.icon as any} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 truncate">{point.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{point.address}</p>
                        {point.metro && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Icon name="Train" size={12} />
                            <span>{point.metro}</span>
                          </div>
                        )}
                        {point.hours && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon name="Clock" size={12} />
                            <span>{point.hours}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {point.categories.map((cat) => (
                            <Badge key={cat.id} variant="secondary" className="text-xs">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, idx) => (
              <Card key={category.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 animate-scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
                  <div className={`absolute top-4 right-4 w-12 h-12 rounded-full ${category.color} flex items-center justify-center shadow-lg`}>
                    <Icon name={category.icon as any} size={24} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="MapPin" size={16} className="text-primary" />
                      <span>{category.pointsCount} пунктов приёма</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveTab('map');
                    }}
                  >
                    <Icon name="Map" className="mr-2" size={16} />
                    Показать на карте
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="how-to" className="animate-fade-in">
          <Card className="p-8">
            <h3 className="text-3xl font-bold mb-6">Как правильно сдавать отходы</h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Search" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">1. Найдите пункт приёма</h4>
                    <p className="text-muted-foreground">
                      Используйте нашу карту, чтобы найти ближайший пункт приёма для вашего типа отходов. 
                      Проверьте режим работы и уточните список принимаемых материалов.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Package" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">2. Подготовьте отходы</h4>
                    <p className="text-muted-foreground">
                      Рассортируйте материалы по категориям. Очистите упаковку от остатков пищи. 
                      Батареи заклейте изолентой. Лампы упакуйте в защитную оболочку.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Truck" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">3. Доставьте в пункт приёма</h4>
                    <p className="text-muted-foreground">
                      Привезите подготовленные отходы в выбранный пункт. Следуйте указаниям персонала. 
                      Некоторые пункты предлагают услугу выездного приёма.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Icon name="AlertCircle" size={20} className="text-primary" />
                  Важно знать
                </h4>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Не смешивайте разные типы отходов в одной упаковке</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Опасные отходы (батареи, лампы) требуют особой упаковки</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Крупногабаритные отходы можно заказать к вывозу через mos.ru</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Многие пункты работают без выходных для вашего удобства</span>
                  </li>
                  <li className="flex gap-2">
                    <Icon name="Check" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">За некоторые виды вторсырья можно получить денежное вознаграждение</span>
                  </li>
                </ul>

                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Icon name="Leaf" size={16} className="text-primary" />
                    Экологический эффект
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Правильная утилизация одной батарейки сохраняет 20 м² почвы от загрязнения. 
                    Переработка 1 тонны бумаги спасает 17 деревьев!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="animate-fade-in">
          <Card className="p-8">
            <h3 className="text-3xl font-bold mb-6">Часто задаваемые вопросы</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Icon name="MessageCircle" size={20} className="text-primary" />
                Не нашли ответ?
              </h4>
              <p className="text-muted-foreground mb-4">
                Свяжитесь с нами, и мы ответим на все ваши вопросы об утилизации отходов
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Icon name="Mail" size={16} />
                  info@ecomoscow.ru
                </Button>
                <Button variant="outline" className="gap-2">
                  <Icon name="Phone" size={16} />
                  8 (495) 123-45-67
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="bg-secondary text-white mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <Icon name="Leaf" className="text-secondary" size={18} />
                </div>
                <span className="font-bold text-lg">ЭкоМосква</span>
              </div>
              <p className="text-sm text-white/80">
                Сервис для поиска пунктов приёма и переработки отходов в Москве. 
                Вместе сделаем город чище!
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Разделы</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Карта пунктов</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Категории отходов</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Инструкции</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  info@ecomoscow.ru
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  8 (495) 123-45-67
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="MapPin" size={16} />
                  Москва, Россия
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
            <p>© 2024 ЭкоМосква. Сделано с заботой о природе</p>
          </div>
        </div>
      </footer>
    </div>
  );
}