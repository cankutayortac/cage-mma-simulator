# CAGE — Sokaktan Zirveye

Mobil öncelikli, Türkçe MMA kariyer oyununun oynanabilir prototipi.

**[iPhone / Safari: Oyunu aç](https://cankutayortac.github.io/cage-mma-simulator/)**

Oyun GitHub Pages üzerinden herkese açık yayınlanır; giriş gerekmez. Yayın kaynağı `gh-pages` dalının kök klasörüdür. Geliştirme kaynakları `main` dalındadır.

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

## v0.4: yaşayan şehir ve aktif antrenman

- **Şehir:** günlük fırsatlar, itibar, sponsor anlaşmaları ve ev yükseltmeleri. Seçenekler kaynak ve zaman bedellerini gösterir; aynı gün yalnız bir fırsat seçilir.
- **Ritimle çalış:** üç zamanlamalı tekrarın ortalaması, normal bir seansa en fazla %25 ek beceri kazancı verir. Tamamlanmadan iptal edilen çalışma kaynak harcamaz.
- **Canlı köşe:** her raund iki talimat, talimatlar arasında üç aksiyon bekleme. Baskı ek nefes harcar; kaçış pozisyona odaklanır; nefes toplamak sonraki hücumdan vazgeçtirir.
- **Geliştirilmiş sahne:** stile göre duruş ve ayak oyunu, darbe tepkileri, temas efektleri, lig atmosferi ve antrenmana yanıt veren hareketler.
- Kamp, rakip analizi, seçili teknikler, antrenman yükü ve önceki mobil kontroller bu sürümün içindedir.

## v0.3: hazırlık kampı ve denge

- Maçı kabul ettiğinde rakip sabitlenir ve 7 oyun günlük kamp başlar. Tarih geldiğinde maç seni bekler; yemek, uyku ve dinlenme hâlâ kullanılabilir.
- Rakip dosyası güçlü/zayıf yönleri, gerçek önceki karşılaşmalarınızı ve köşe önerisini gösterir. Mesafe/gard, yere alınma savunması ve yerden kaçış hazırlığı yalnız ilgili maça etki eder.
- En fazla dört öğrenilmiş teknik maç setine seçilir. Temel hareketler daima kullanılabilir; rakipler de seviyelerine uygun teknikler kullanır.
- İlk ev antrenmanı yaklaşık 0,9 beceri kazandırır. Aynı gün tekrarlar daha az verimli, yük birikimi maça yansır. Uyku ve dinlenme yükü azaltır.
- İlerleme için yer altında 3, amatörde 4, profesyonelde 6 lig galibiyeti gerekir; alt lig maçları üst lig ilerlemesini artırmaz. Dünya liginde 7 galibiyet kemer getirir.
- Eski kayıtların para, beceri, hareket ve açık ligleri korunur. Devam eden eski maçlar tamamlanabilir.

Dengeyi `npm run balance` ile yeniden ölçebilirsin. İlk rakip, dengeli taktik ve 2.000 tohumla: hazırlıksız %17,3; 21 seanslık gerçek bütçeli kamp %64,2; aynı beceriler hazırlık bonusu olmadan %49,2; yüksek yükle %21,6. Bunlar belirli senaryonun ölçümleri, tek bir maç için kazanma garantisi değildir.

## v0.2 güncellemesi

- Aksiyon başına 3,6–6 saniyelik normal izleme, 0,5× / 1× / 2× hız ve gerçek animasyon duraklatma.
- Darbe, savunma, yere alma ve yerde mücadele için farklı hareketler; okunabilir maç günlüğü.
- Sabit ihtiyaç ve para çubuğu; portre içinde altı yetenek.
- İşlemlerde kaydırma konumu ve sekmelerin son konumu korunur. Seri dokunma yakınlaştırması engellenir.
- Eski kariyer kayıtları desteklenir; güncellemeyi görmek için sayfayı yenilemek yeterlidir.

## Bilgisayarında çalıştır

Derleme veya paket kurulumu gerekmez. Python 3 ile depo klasöründe:

```sh
python -m http.server 8000 --directory dist
```

Tarayıcıda http://localhost:8000 adresini aç. JavaScript modülleri kullanıldığı için `index.html` dosyasını doğrudan çift tıklamak yerine HTTP sunucusu kullan.

## GitHub Pages yayını

`dist` klasöründeki değişiklikleri `main` dalına commit ettikten sonra:

```sh
git push origin main
git subtree push --prefix dist origin gh-pages
```

GitHub, `gh-pages` güncellendiğinde oyunu yeniden yayınlar. Yalnız `main` dalına push yapmak oyun yayınını güncellemez.

## Testler

Node.js 22 veya üstü ile:

```sh
npm test
```

77 kontrol; ekonomi, beceri ayrımı, hareket öğrenimi, maçın sonlanması, ödülün tek kez verilmesi, aksiyon geçmişi ve farklı tohumlarla 300 maç simülasyonunu kapsar. Kamp testleri tarih sınırları, hazırlık, yük, teknik seçimi ve lig ilerlemesini doğrular. Şehir, sponsor, ev, ritim antrenmanı ve köşe talimatları ayrıca sınanır. Zamanlayıcı testleri duraklatma, hız değiştirme ve okuma süresini doğrular.

## Kaynak yapısı

| Dosya | Görevi |
| --- | --- |
| `dist/world.js` | Şehir fırsatları, itibar, ev ve sponsor ekonomisi |
| `dist/world-ui.js` | Şehir haritası ve kariyer seçenekleri |
| `dist/activity.js` | Aktif antrenman zamanlama puanı |
| `dist/camp.js` | Hazırlık kampı, odak çalışmaları ve antrenman yükü |
| `dist/camp-ui.js` | Kamp, rakip dosyası ve teknik seti arayüzü |
| `dist/engine.js` | İhtiyaçlar, ekonomi, antrenman ve maç simülasyonu |
| `dist/scene.js` | 3B dövüşçüler, ortam ve animasyon |
| `dist/app.js` | Arayüz, işlemler ve cihaz kaydı |
| `dist/playback.js` | Okuma süresi, hız ve duraklatma zamanlayıcısı |
| `dist/style.css` | Mobil ve masaüstü görünümü |
| `tests/engine.test.mjs` | Oyun mantığı kontrolleri |
| `tests/world.test.mjs` | Şehir ekonomisi ve ödül sınırları |
| `tests/activity.test.mjs` | Ritim puanı ve aktif çalışma sınırları |
| `tests/camp.test.mjs` | Kamp ve hazırlık kuralları |
| `tests/balance.mjs` | Tekrarlanabilir zorluk raporu |
| `tests/playback.test.mjs` | Maç izleme zamanlayıcısı kontrolleri |

## Prototipin sınırları

Animasyonlar stilizedir; ayrıntılı insan rigleri veya gerçekçi MMA hareketleri henüz yoktur. Spor salonları ortak temel sahneyi kullanır. Bulut kaydı, çevrimdışı oynama ve çok oyunculu mod yoktur. Mobil ekran boyutlarında test edildi; gerçek iPhone donanımında doğrulanmadı.

Kayıtlar yalnız kullanıldığı tarayıcı ve adreste saklanır. Safari verilerini temizlemeden veya başka adrese geçmeden önce Ayarlar'dan kaydı dışa aktar. Başka bir yayın adresi mevcut kaydı otomatik taşımaz.

## Üçüncü taraf bileşenleri

Three.js 0.180.0 dosyaları oyunla birlikte gelir; lisans `dist/vendor/THREE-LICENSE.txt` içindedir. Google Fonts üzerinden Barlow Condensed ve DM Sans yüklenir; erişilemezse sistem yazı tipleri kullanılır.
