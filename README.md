# CAGE — Sokaktan Zirveye

Mobil öncelikli, Türkçe MMA kariyer oyununun oynanabilir prototipi. Güncel sürüm: **v0.5.0**.

**[iPhone / Safari: Oyunu aç](https://cankutayortac.github.io/cage-mma-simulator/)**

Oyun GitHub Pages üzerinden herkese açık yayınlanır; giriş gerekmez. Yayın kaynağı `gh-pages` dalının kök klasörüdür. Geliştirme kaynakları `main` dalındadır.

## iPhone'da oyna

Bağlantıyı Safari'de aç. Paylaş → Ana Ekrana Ekle yoluyla oyunu ana ekranına ekleyebilirsin. Oyun internet bağlantısı gerektirir; bu depo App Store veya IPA paketi içermez.

## Oyunda neler var?

- Boks, kickboks, güreş ve Brazilian Jiu-Jitsu için ayrı beceriler.
- Koşu, ip atlama, kuvvet çalışması ve öğrenilebilir hareketler.
- Enerji, tokluk, dinçlik ve sağlık yönetimi.
- Evden modern performans salonuna dört antrenman alanı ve seçilebilir antrenörler.
- Yer altından dünya ligine yükselme, gündelik iş ve maç ödülleri.
- İzlenebilir 3B maçlar; dengeli, ayakta baskı, yere al ve savunma taktikleri.
- Kuvvete bağlı görsel kas gelişimi, tarayıcı kaydı ve JSON kayıt aktarımı.

## v0.5: kariyer, rekabet ve yeni mobil arayüz

- **Beş ana ekran:** Merkez, Antrenman, Dövüş, Şehir ve Kariyer. Antrenman, salon, teknik, sıralama, hedef ve geçmiş seçenekleri kendi sekmelerinde açılır. Merkez, ihtiyaçlarına ve kampına göre bir sonraki adımı önerir.
- **Ulaşılabilir ihtiyaçlar:** para ve ihtiyaç çubuğu kaydırırken görünür kalır. İhtiyaçlara dokununca yemek, uyku ve dinlenme paneli açılır. Altı beceri karakter portresinin sağ üstündedir; işlemler sayfayı başa atmaz, kontrol düğmelerinde seri dokunma yakınlaştırması engellenir.
- **32 kalıcı rakip:** dört ligde sekizer isimli dövüşçü; her ligde oyuncuyla birlikte dokuz kişilik sıralama. Üç maç teklifinden rakibini seçebilir, stilini inceleyebilir ve önceki karşılaşmalarınızı görebilirsin. Rakiplerin becerileri sen geliştikçe otomatik yükselmez.
- **Gerçek sıralama ve rövanşlar:** üstündeki rakibi yenmek sıralamanı yükseltir; altındaki rakibe kaybetmek bir basamak düşürür. Her rakiple galibiyet, mağlubiyet ve beraberlik kaydı tutulur. Aynı rakibi tekrar yenmek para ve maç karnesi kazandırır; lig ilerlemesi için farklı rakipler gerekir.
- **12 kariyer hedefi:** üç bölümde antrenman, ilk maç, teknik, salon, sponsor ve ev hedefleri. Tamamladığın hedefin para ve varsa itibar ödülünü Kariyer → Hedefler'den bir kez alırsın.
- **Raund araları ve maç dosyası:** ilk iki raundun sonunda oyun durur; isabet, yere alma, kaçış ve kondisyon özetini görüp taktiğini seçersin. Sonraki raund sen devam ettiğinde başlar. Ayrıntılı maç günlüğü ve toplam istatistikler ayrıca açılır.
- **Sahne ve ses:** stile göre hareketler, darbe tepkileri, kafese giriş, köşeye dönüş ve sonuç pozları; salon ve ev seviyesine göre değişen dekor. İsteğe bağlı zil, darbe ve antrenman sesleri tarayıcıda üretilir. Ses ilk kullanımda kapalıdır; seçimin cihazda saklanır.

## Antrenman, kamp ve maç kuralları

- **Gelişim:** ilk ev antrenmanı yaklaşık 0,9 beceri kazandırır. Aynı gün tekrarlar daha az verimli olur; biriken yük antrenman ve maç performansını azaltır. Uyku ve dinlenme yükü düşürür. Salon ve uzman antrenörler gelişimi artırır; seans bedelleri ekranda gösterilir.
- **Aktif çalışma:** “Ritimle çalış” içinde üç zamanlamalı tekrarın ortalaması, normal bir seansa en fazla %25 ek beceri kazancı verir. Kaynak ve zaman yalnız üçüncü tekrarda, tek seans olarak harcanır. Tamamlamadan iptal etmek ücretsizdir; “Hızlı çalış” normal kazancı verir.
- **Kamp:** maçı kabul ettiğinde seçtiğin rakip sabitlenir ve 7 oyun günlük hazırlık başlar. Mesafe/gard, yere alınma savunması ve yerden kaçış çalışmaları yalnız ilgili maça hazırlık sağlar. Maç günü yeni antrenman yapılamaz; yemek, uyku ve dinlenme kullanılabilir. Maç sen hazır olana kadar bekler.
- **Teknik seti:** yeterli beceriye ulaşıp iki çalışma tamamlayarak yeni hareket öğrenirsin. En fazla dört öğrenilmiş teknik seçebilirsin; seçimin maç başladığında sabitlenir. Temel hareketler daima kullanılabilir; rakipler de seviyelerine uygun teknikler kullanır.
- **İzleme:** aksiyon başına normal hızda 3,6–6 saniye okuma süresi, 0,5× / 1× / 2× hız ve duraklatma vardır. Maçlar en fazla üç raund sürer; nakavt veya pes ettirmeyle erken bitebilir.
- **Canlı köşe:** her raund toplam iki talimat hakkı ve talimatlar arasında üç aksiyon bekleme vardır. Baskı iki hücumu güçlendirip ek nefes harcar; mesafe açma kaçış ve yere alınma savunmasını destekler; nefes toplamak sonraki hücumdan vazgeçtirir.
- **Lig yükselişi:** yer altında 3, amatörde 4, profesyonelde 6 farklı rakibi yenmek gerekir. Alt lig maçları üst ligin ilerlemesini artırmaz. Dünya kemeri için **7 farklı dünya ligi rakibi galibiyeti ve dünya sıralamasında 1. sıra** birlikte gerekir.

Şehirde her oyun günü üç fırsat sunulur ve yalnız biri seçilir. Etkinlikler, sponsor anlaşmaları ve ev yükseltmeleri kariyeri destekler. Sponsor ödemeleri uygun ligdeki maçlar için günde en fazla bir kez yapılır; daha iyi evler toparlanmaya sınırlı ek fayda sağlar.

Dengeyi `npm run balance` ile yeniden ölçebilirsin. v0.5'te ilk rakibe karşı dengeli taktik ve senaryo başına 2.000 tohumla:

| Senaryo | Galibiyet oranı |
| --- | ---: |
| Hazırlıksız başlangıç | %17,3 |
| 21 seanslık kamp, toparlanma ve rakibe özel hazırlık | %64,2 |
| Aynı beceriler, rakibe özel hazırlık bonusu olmadan | %49,2 |
| Aynı beceriler ve hazırlık, yüksek antrenman yüküyle | %21,6 |

21 seanslık kamp başlangıçtaki ₺250 ile gerçek oyun işlemlerini kullanır; toplam 48 işlem ve 168,5 oyun saati sonunda ₺215 kalır. Bunlar belirli senaryoların ölçümleridir; her rakip ve taktik için aynı oranı veya tek maçta galibiyeti garanti etmez.

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

**119 otomatik kontrol** geçer: 41 oyun motoru, 13 kamp, 15 şehir, 4 ritim, 7 oynatma, 12 rekabet, 11 hedef, 10 görünüm ve 6 maç raporu kontrolü.

Testler ekonomi, beceri ve teknik ayrımı, kayıt doğrulama, sabit rakip seçimi, hazırlık ve yük, aktif antrenmanın tek seans maliyeti, köşe talimatı sınırları ve ödüllerin yalnız bir kez verilmesini kapsar. 300 tohumla maçların sonlanması; tekrarlanan rakiplerden lig ilerlemesi kazanılamaması; kemer için hem galibiyet hem sıra koşulu; raund aralarının bir kez açılması ve kayıt sonrası sürmesi ayrıca doğrulanır. Görünüm testleri sekmeleri, kaynak durumuna uygun yönlendirmeyi ve içe aktarılan metinlerin güvenli gösterimini denetler. Tarayıcı görünümü, dokunma davranışı ve ses için cihaz üzerinde ayrıca kontrol gerekir.

## Kaynak yapısı

| Dosya | Görevi |
| --- | --- |
| `dist/app.js` | Ekran akışı, paneller, aktif antrenman ve cihaz kaydı |
| `dist/views.js` | Merkez, antrenman, maç teklifleri ve kariyer görünümleri |
| `dist/engine.js` | İhtiyaçlar, ekonomi, antrenman ve maç simülasyonu |
| `dist/competition.js` | Kalıcı rakipler, maç teklifleri, sıralama ve karşılaşma kayıtları |
| `dist/objectives.js` | Kariyer hedefleri, ilerleme ve tek seferlik ödüller |
| `dist/world.js` | Şehir fırsatları, itibar, ev ve sponsor ekonomisi |
| `dist/world-ui.js` | Şehir, sponsor, ev sekmeleri ve etkinlik panelleri |
| `dist/activity.js` | Aktif antrenman zamanlama puanı |
| `dist/camp.js` | Hazırlık kampı, odak çalışmaları ve antrenman yükü |
| `dist/camp-ui.js` | Kamp, rakip dosyası ve teknik seti arayüzü |
| `dist/scene.js` | 3B dövüşçüler, ortam ve animasyon |
| `dist/playback.js` | Okuma süresi, hız ve duraklatma zamanlayıcısı |
| `dist/match-report.js` | Maç ve raund istatistikleri, köşe önerisi ve ara koşulu |
| `dist/audio.js` | İsteğe bağlı, tarayıcıda üretilen ses efektleri |
| `dist/style.css` | Mobil ve masaüstü görünümü |
| `tests/engine.test.mjs` | Oyun mantığı kontrolleri |
| `tests/world.test.mjs` | Şehir ekonomisi ve ödül sınırları |
| `tests/activity.test.mjs` | Ritim puanı ve aktif çalışma sınırları |
| `tests/camp.test.mjs` | Kamp ve hazırlık kuralları |
| `tests/competition.test.mjs` | Rakip seçimi, sıralama, rövanş ve kemer koşulları |
| `tests/objectives.test.mjs` | Hedef ilerlemesi ve tek seferlik ödüller |
| `tests/views.test.mjs` | Ekran sekmeleri, durumlara uygun kontroller ve metin güvenliği |
| `tests/match-report.test.mjs` | Aksiyon istatistikleri ve raund araları |
| `tests/balance.mjs` | Tekrarlanabilir zorluk raporu |
| `tests/playback.test.mjs` | Maç izleme zamanlayıcısı kontrolleri |

## Prototipin sınırları

Karakterler ve animasyonlar stilizedir; hareket yakalama veya fotogerçekçi MMA animasyonları yoktur. Salon ve ev dekorları seviyeye göre değişen, kodla oluşturulmuş 3B sahnelerdir. Bulut kaydı, çevrimdışı oynama ve çok oyunculu mod yoktur. Mobil ekran boyutlarında test edildi; gerçek iPhone donanımında doğrulanmadı.

Kayıtlar yalnız kullanıldığı tarayıcı ve adreste saklanır. Safari verilerini temizlemeden veya başka adrese geçmeden önce Ayarlar'dan kaydı dışa aktar. Başka bir yayın adresi mevcut kaydı otomatik taşımaz.

## Üçüncü taraf bileşenleri

Three.js 0.180.0 dosyaları oyunla birlikte gelir; lisans `dist/vendor/THREE-LICENSE.txt` içindedir. Google Fonts üzerinden Barlow Condensed ve DM Sans yüklenir; erişilemezse sistem yazı tipleri kullanılır.
