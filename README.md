# CAGE — Sokaktan Zirveye

Mobil öncelikli, Türkçe MMA kariyer oyununun oynanabilir prototipi.

**[Oyunu aç](https://cage-mma-yolculuk.c-kutay.chatgpt.site/)**

Oyun bağlantısı Sites üzerinde yayınlanır ve sahibinin ChatGPT hesabıyla giriş gerektirebilir. Bu GitHub deposu kaynak kodunu ayrı olarak barındırır; GitHub'a yapılan değişiklikler mevcut oyun bağlantısını otomatik güncellemez.

## iPhone'da oyna

Bağlantıyı Safari'de aç. İstersen Paylaş → Ana Ekrana Ekle yoluyla kısayol oluştur. İlk sürüm internet bağlantısı gerektirir. Bu depo App Store veya IPA paketi içermez.

## Oyunda neler var?

- Boks, kickboks, güreş ve Brazilian Jiu-Jitsu için ayrı beceriler.
- Koşu, ip atlama, kuvvet çalışması ve öğrenilebilir hareketler.
- Enerji, tokluk, dinçlik ve sağlık yönetimi.
- Evden profesyonel salona dört antrenman alanı ve seçilebilir antrenörler.
- Yer altından dünya ligine yükselme, gündelik iş ve maç ödülleri.
- İzlenebilir 3B maçlar; dengeli, ayakta baskı, yere al ve savunma taktikleri.
- Kuvvete bağlı görsel kas gelişimi, tarayıcı kaydı ve JSON kayıt aktarımı.

## Bilgisayarında çalıştır

Derleme veya paket kurulumu gerekmez. Python 3 ile depo klasöründe:

```sh
python -m http.server 8000 --directory dist
```

Tarayıcıda http://localhost:8000 adresini aç. JavaScript modülleri kullanıldığı için `index.html` dosyasını doğrudan çift tıklamak yerine HTTP sunucusu kullan.

## Testler

Node.js 22 veya üstü ile:

```sh
npm test
```

13 kontrol; ekonomi, beceri ayrımı, hareket öğrenimi, maçın sonlanması, kayıt devamlılığı, ödülün tek kez verilmesi ve farklı tohumlarla 300 maç simülasyonunu kapsar.

## Kaynak yapısı

| Dosya | Görevi |
| --- | --- |
| `dist/engine.js` | İhtiyaçlar, ekonomi, antrenman ve maç simülasyonu |
| `dist/scene.js` | 3B dövüşçüler, ortam ve animasyon |
| `dist/app.js` | Arayüz, işlemler ve cihaz kaydı |
| `dist/style.css` | Mobil ve masaüstü görünümü |
| `tests/engine.test.mjs` | Oyun mantığı kontrolleri |

## İlk sürümün sınırları

Animasyonlar stilizedir; ayrıntılı insan rigleri veya gerçekçi MMA hareketleri henüz yoktur. Spor salonları ortak temel sahneyi kullanır. Bulut kaydı, çevrimdışı oynama ve çok oyunculu mod yoktur. Mobil ekran boyutlarında test edildi; gerçek iPhone donanımında doğrulanmadı.

Kayıtlar yalnız kullanıldığı tarayıcı ve adreste saklanır. Safari verilerini temizlemeden veya başka adrese geçmeden önce Ayarlar'dan kaydı dışa aktar. Başka bir yayın adresi mevcut kaydı otomatik taşımaz.

## Üçüncü taraf bileşenleri

Three.js 0.180.0 dosyaları oyunla birlikte gelir; lisans `dist/vendor/THREE-LICENSE.txt` içindedir. Google Fonts üzerinden Barlow Condensed ve DM Sans yüklenir; erişilemezse sistem yazı tipleri kullanılır.
