import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const wasteCategories = [
  {
    id: 'batteries',
    name: 'Батареи и аккумуляторы',
    icon: 'Battery',
    color: 'bg-yellow-100 text-yellow-700',
    image: 'https://cdn.poehali.dev/projects/d3be30ee-5229-45ad-8f27-d48a76e25e47/files/9280aa9e-e0ab-4234-9f3e-3392ef0880c7.jpg',
    description: 'Приём батареек, аккумуляторов, источников питания',
    points: [
      { name: 'ЭкоЦентр на Варшавке', address: 'Варшавское шоссе, 33', metro: 'Нагатинская', hours: '10:00-20:00' },
      { name: 'Пункт приёма Вторая Жизнь', address: 'ул. Профсоюзная, 45', metro: 'Профсоюзная', hours: '09:00-21:00' },
      { name: 'ГринПоинт Юго-Запад', address: 'Ленинский просп., 82', metro: 'Юго-Западная', hours: '08:00-22:00' }
    ]
  },
  {
    id: 'textiles',
    name: 'Текстиль и одежда',
    icon: 'Shirt',
    color: 'bg-pink-100 text-pink-700',
    image: 'https://cdn.poehali.dev/projects/d3be30ee-5229-45ad-8f27-d48a76e25e47/files/be398764-dd02-4c68-a2d9-91551f1865f4.jpg',
    description: 'Старая одежда, обувь, текстильные изделия',
    points: [
      { name: 'Charity Shop', address: 'Тверская ул., 12', metro: 'Тверская', hours: '11:00-19:00' },
      { name: 'Второй Шанс', address: 'ул. Арбат, 28', metro: 'Арбатская', hours: '10:00-20:00' },
      { name: 'БлагоДар', address: 'Кутузовский просп., 15', metro: 'Кутузовская', hours: '09:00-18:00' }
    ]
  },
  {
    id: 'tires',
    name: 'Шины',
    icon: 'Circle',
    color: 'bg-slate-100 text-slate-700',
    image: 'https://cdn.poehali.dev/projects/d3be30ee-5229-45ad-8f27-d48a76e25e47/files/9b1de424-10ff-4501-958b-28a1d72d2d12.jpg',
    description: 'Автомобильные и велосипедные покрышки',
    points: [
      { name: 'ШиноПрием', address: 'МКАД 47 км', metro: 'Выхино', hours: '08:00-20:00' },
      { name: 'ЭкоШина', address: 'Каширское шоссе, 112', metro: 'Домодедовская', hours: '09:00-19:00' }
    ]
  },
  {
    id: 'lamps',
    name: 'Ртутные лампы',
    icon: 'Lightbulb',
    color: 'bg-orange-100 text-orange-700',
    image: 'https://cdn.poehali.dev/projects/d3be30ee-5229-45ad-8f27-d48a76e25e47/files/9b1de424-10ff-4501-958b-28a1d72d2d12.jpg',
    description: 'Энергосберегающие и люминесцентные лампы',
    points: [
      { name: 'ЭкоЛампа', address: 'ул. Гарибальди, 23', metro: 'Новые Черёмушки', hours: '10:00-18:00' },
      { name: 'БезОпасность', address: 'Дмитровское шоссе, 71', metro: 'Петровско-Разумовская', hours: '09:00-20:00' }
    ]
  },
  {
    id: 'oil',
    name: 'ГСМ',
    icon: 'Fuel',
    color: 'bg-blue-100 text-blue-700',
    image: 'https://cdn.poehali.dev/projects/d3be30ee-5229-45ad-8f27-d48a76e25e47/files/9b1de424-10ff-4501-958b-28a1d72d2d12.jpg',
    description: 'Отработанное масло, топливо, смазочные материалы',
    points: [
      { name: 'МаслоСбор', address: 'ул. Автозаводская, 16', metro: 'Автозаводская', hours: '08:00-17:00' },
      { name: 'ЭкоНефть', address: 'Волгоградский просп., 42', metro: 'Текстильщики', hours: '09:00-18:00' }
    ]
  }
];

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

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('map');

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
              <p className="text-muted-foreground">Выберите категорию отходов, чтобы увидеть ближайшие пункты приёма</p>
            </div>
            
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button 
                variant={selectedCategory === null ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Все категории
              </Button>
              {wasteCategories.map(cat => (
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

            <div className="bg-muted rounded-lg overflow-hidden mb-6" style={{ height: '500px' }}>
              <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-green-50 to-blue-50">
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 800 600">
                    <circle cx="200" cy="150" r="8" fill="#10b981" />
                    <circle cx="350" cy="200" r="8" fill="#10b981" />
                    <circle cx="500" cy="180" r="8" fill="#10b981" />
                    <circle cx="300" cy="350" r="8" fill="#10b981" />
                    <circle cx="450" cy="400" r="8" fill="#10b981" />
                    <circle cx="600" cy="300" r="8" fill="#10b981" />
                    <circle cx="250" cy="450" r="8" fill="#10b981" />
                    <path d="M 100 100 Q 400 50 700 150" stroke="#059669" strokeWidth="2" fill="none" opacity="0.3" />
                    <path d="M 150 500 Q 400 400 650 450" stroke="#059669" strokeWidth="2" fill="none" opacity="0.3" />
                  </svg>
                </div>
                <div className="text-center z-10">
                  <Icon name="Map" size={64} className="text-primary mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2">Интерактивная карта Москвы</h4>
                  <p className="text-muted-foreground max-w-md">
                    {selectedCategory 
                      ? `Показаны пункты приёма: ${wasteCategories.find(c => c.id === selectedCategory)?.name}`
                      : 'Здесь будет отображена карта с пунктами приёма отходов по всей Москве'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wasteCategories
                .filter(cat => selectedCategory === null || cat.id === selectedCategory)
                .flatMap(cat => cat.points.map(point => ({...point, category: cat})))
                .map((point, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${point.category.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={point.category.icon as any} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 truncate">{point.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{point.address}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Icon name="Train" size={12} />
                          <span>{point.metro}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon name="Clock" size={12} />
                          <span>{point.hours}</span>
                        </div>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {point.category.name}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wasteCategories.map((category, idx) => (
              <Card key={category.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 animate-scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform hover:scale-110"
                  />
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
                      <span>{category.points.length} пунктов приёма</span>
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
