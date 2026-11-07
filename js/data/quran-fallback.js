/* =====================================================================
   Data Al-Qur'an bawaan (cadangan offline)
   Daftar surah + ayat bawaan (RAW). Dipakai bila data lengkap dari internet belum pernah berhasil dimuat.
   ===================================================================== */
'use strict';

/* =====================================================================
   DATA AL-QUR'AN  —  tiap surah: nomor, nama, nama Arab, arti nama, juz,
   nomor ayat awal (from), dan daftar ayat [teks Arab, terjemah Indonesia].
   Audio: EveryAyah (Mishary Alafasy) dengan pola SSSAAA.mp3.
   Untuk menambah materi: cukup tambahkan objek baru di RAW.
   ===================================================================== */
const RAW = [
    /* ---------------------------- JUZ 30 ---------------------------- */
    { no: 114, name: "An-Nas", ar: "الناس", mean: "Manusia", juz: 30, v: [
            ["قُلْ أَعُوذُ بِرَبِّ النَّاسِ", "Katakanlah, “Aku berlindung kepada Tuhannya manusia,"],
            ["مَلِكِ النَّاسِ", "raja manusia,"],
            ["إِلَٰهِ النَّاسِ", "sembahan manusia,"],
            ["مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", "dari kejahatan (bisikan) setan yang bersembunyi,"],
            ["الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", "yang membisikkan (kejahatan) ke dalam dada manusia,"],
            ["مِنَ الْجِنَّةِ وَالنَّاسِ", "dari (golongan) jin dan manusia.”"]
        ] },
    { no: 113, name: "Al-Falaq", ar: "الفلق", mean: "Waktu Subuh", juz: 30, v: [
            ["قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", "Katakanlah, “Aku berlindung kepada Tuhan yang menguasai subuh (fajar),"],
            ["مِن شَرِّ مَا خَلَقَ", "dari kejahatan (makhluk yang) Dia ciptakan,"],
            ["وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", "dan dari kejahatan malam apabila telah gelap gulita,"],
            ["وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", "dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),"],
            ["وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", "dan dari kejahatan orang yang dengki apabila dia dengki.”"]
        ] },
    { no: 112, name: "Al-Ikhlas", ar: "الإخلاص", mean: "Memurnikan Keesaan Allah", juz: 30, v: [
            ["قُلْ هُوَ اللَّهُ أَحَدٌ", "Katakanlah (Muhammad), “Dialah Allah, Yang Maha Esa."],
            ["اللَّهُ الصَّمَدُ", "Allah tempat meminta segala sesuatu."],
            ["لَمْ يَلِدْ وَلَمْ يُولَدْ", "(Allah) tidak beranak dan tidak pula diperanakkan,"],
            ["وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", "dan tidak ada sesuatu yang setara dengan Dia.”"]
        ] },
    { no: 111, name: "Al-Masad", ar: "المسد", mean: "Sabut", juz: 30, v: [
            ["تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ", "Binasalah kedua tangan Abu Lahab dan benar-benar binasa dia."],
            ["مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ", "Tidaklah berguna baginya hartanya dan apa yang dia usahakan."],
            ["سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ", "Kelak dia akan masuk ke dalam api yang bergejolak (neraka),"],
            ["وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ", "dan (begitu pula) istrinya, pembawa kayu bakar (penyebar fitnah)."],
            ["فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ", "Di lehernya ada tali dari sabut yang dipintal."]
        ] },
    { no: 110, name: "An-Nasr", ar: "النصر", mean: "Pertolongan", juz: 30, v: [
            ["إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", "Apabila telah datang pertolongan Allah dan kemenangan,"],
            ["وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", "dan engkau melihat manusia berbondong-bondong masuk agama Allah,"],
            ["فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا", "maka bertasbihlah dengan memuji Tuhanmu dan mohonlah ampun kepada-Nya. Sungguh, Dia Maha Penerima tobat."]
        ] },
    { no: 109, name: "Al-Kafirun", ar: "الكافرون", mean: "Orang-orang Kafir", juz: 30, v: [
            ["قُلْ يَا أَيُّهَا الْكَافِرُونَ", "Katakanlah (Muhammad), “Wahai orang-orang kafir!"],
            ["لَا أَعْبُدُ مَا تَعْبُدُونَ", "Aku tidak akan menyembah apa yang kamu sembah,"],
            ["وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ", "dan kamu bukan penyembah apa yang aku sembah."],
            ["وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ", "Dan aku tidak pernah menjadi penyembah apa yang kamu sembah,"],
            ["وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ", "dan kamu tidak pernah (pula) menjadi penyembah apa yang aku sembah."],
            ["لَكُمْ دِينُكُمْ وَلِيَ دِينِ", "Untukmu agamamu, dan untukkulah agamaku.”"]
        ] },
    { no: 108, name: "Al-Kautsar", ar: "الكوثر", mean: "Nikmat yang Banyak", juz: 30, v: [
            ["إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", "Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak."],
            ["فَصَلِّ لِرَبِّكَ وَانْحَرْ", "Maka laksanakanlah salat karena Tuhanmu, dan berkurbanlah (sebagai bentuk ibadah dan rasa syukur)."],
            ["إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", "Sungguh, orang-orang yang membencimu dialah yang terputus (dari rahmat Allah)."]
        ] },
    { no: 107, name: "Al-Ma'un", ar: "الماعون", mean: "Barang yang Berguna", juz: 30, v: [
            ["أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ", "Tahukah kamu (orang) yang mendustakan agama?"],
            ["فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ", "Maka itulah orang yang menghardik anak yatim,"],
            ["وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ", "dan tidak mendorong memberi makan orang miskin."],
            ["فَوَيْلٌ لِّلْمُصَلِّينَ", "Maka celakalah orang yang salat,"],
            ["الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ", "(yaitu) orang-orang yang lalai terhadap salatnya,"],
            ["الَّذِينَ هُمْ يُرَاءُونَ", "yang berbuat riya,"],
            ["وَيَمْنَعُونَ الْمَاعُونَ", "dan enggan (memberikan) bantuan."]
        ] },
    { no: 106, name: "Quraisy", ar: "قريش", mean: "Suku Quraisy", juz: 30, v: [
            ["لِإِيلَافِ قُرَيْشٍ", "Karena kebiasaan orang-orang Quraisy,"],
            ["إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ", "(yaitu) kebiasaan mereka bepergian pada musim dingin dan musim panas."],
            ["فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ", "Maka hendaklah mereka menyembah Tuhan (pemilik) rumah ini (Ka'bah),"],
            ["الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ", "yang telah memberi makanan kepada mereka untuk menghilangkan lapar dan mengamankan mereka dari rasa ketakutan."]
        ] },
    { no: 105, name: "Al-Fil", ar: "الفيل", mean: "Gajah", juz: 30, v: [
            ["أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ", "Tidakkah engkau (Muhammad) perhatikan bagaimana Tuhanmu telah bertindak terhadap pasukan bergajah?"],
            ["أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ", "Bukankah Dia telah menjadikan tipu daya mereka itu sia-sia?"],
            ["وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ", "dan Dia mengirimkan kepada mereka burung yang berbondong-bondong,"],
            ["تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ", "yang melempari mereka dengan batu (berasal) dari tanah yang terbakar,"],
            ["فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ", "sehingga mereka dijadikan-Nya seperti daun-daun yang dimakan (ulat)."]
        ] },
    { no: 104, name: "Al-Humazah", ar: "الهمزة", mean: "Pengumpat", juz: 30, v: [
            ["وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ", "Celakalah bagi setiap pengumpat dan pencela,"],
            ["الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ", "yang mengumpulkan harta dan menghitung-hitungnya,"],
            ["يَحْسَبُ أَنَّ مَالَهُ أَخْلَدَهُ", "dia mengira bahwa hartanya itu dapat mengekalkannya."],
            ["كَلَّا ۖ لَيُنبَذَنَّ فِي الْحُطَمَةِ", "Sekali-kali tidak! Pasti dia akan dilemparkan ke dalam (neraka) Huthamah."],
            ["وَمَا أَدْرَاكَ مَا الْحُطَمَةُ", "Dan tahukah kamu apakah (neraka) Huthamah itu?"],
            ["نَارُ اللَّهِ الْمُوقَدَةُ", "(Yaitu) api (azab) Allah yang dinyalakan,"],
            ["الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ", "yang (membakar) sampai ke hati."],
            ["إِنَّهَا عَلَيْهِم مُّؤْصَدَةٌ", "Sungguh, api itu ditutup rapat atas (diri) mereka,"],
            ["فِي عَمَدٍ مُّمَدَّدَةٍ", "(sedang mereka itu) diikat pada tiang-tiang yang panjang."]
        ] },
    { no: 103, name: "Al-Asr", ar: "العصر", mean: "Masa", juz: 30, v: [
            ["وَالْعَصْرِ", "Demi masa,"],
            ["إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", "sungguh, manusia berada dalam kerugian,"],
            ["إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ", "kecuali orang-orang yang beriman dan mengerjakan kebajikan serta saling menasihati untuk kebenaran dan saling menasihati untuk kesabaran."]
        ] },
    { no: 102, name: "At-Takatsur", ar: "التكاثر", mean: "Bermegah-megahan", juz: 30, v: [
            ["أَلْهَاكُمُ التَّكَاثُرُ", "Bermegah-megahan telah melalaikan kamu,"],
            ["حَتَّىٰ زُرْتُمُ الْمَقَابِرَ", "sampai kamu masuk ke dalam kubur."],
            ["كَلَّا سَوْفَ تَعْلَمُونَ", "Sekali-kali tidak! Kelak kamu akan mengetahui (akibat perbuatanmu itu),"],
            ["ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ", "kemudian sekali-kali tidak! Kelak kamu akan mengetahui."],
            ["كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ", "Sekali-kali tidak! Sekiranya kamu mengetahui dengan pasti,"],
            ["لَتَرَوُنَّ الْجَحِيمَ", "niscaya kamu benar-benar akan melihat (neraka) Jahim,"],
            ["ثُمَّ لَتَرَوُنَّهَا عَيْنَ الْيَقِينِ", "kemudian kamu benar-benar akan melihatnya dengan mata kepala sendiri."],
            ["ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ", "Kemudian kamu benar-benar akan ditanya pada hari itu tentang kenikmatan (yang megah di dunia itu)."]
        ] },
    { no: 101, name: "Al-Qari'ah", ar: "القارعة", mean: "Hari Kiamat", juz: 30, v: [
            ["الْقَارِعَةُ", "Hari Kiamat,"],
            ["مَا الْقَارِعَةُ", "apakah hari Kiamat itu?"],
            ["وَمَا أَدْرَاكَ مَا الْقَارِعَةُ", "Dan tahukah kamu apakah hari Kiamat itu?"],
            ["يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ", "Pada hari itu manusia seperti anai-anai yang berterbangan,"],
            ["وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ", "dan gunung-gunung seperti bulu yang dihambur-hamburkan."],
            ["فَأَمَّا مَن ثَقُلَتْ مَوَازِينُهُ", "Maka adapun orang yang berat timbangan (kebaikannya),"],
            ["فَهُوَ فِي عِيشَةٍ رَّاضِيَةٍ", "maka dia berada dalam kehidupan yang memuaskan."],
            ["وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ", "Dan adapun orang yang ringan timbangan (kebaikannya),"],
            ["فَأُمُّهُ هَاوِيَةٌ", "maka tempat kembalinya adalah neraka Hawiyah."],
            ["وَمَا أَدْرَاكَ مَا هِيَهْ", "Dan tahukah kamu apakah neraka Hawiyah itu?"],
            ["نَارٌ حَامِيَةٌ", "(Yaitu) api yang sangat panas."]
        ] },
    { no: 100, name: "Al-Adiyat", ar: "العاديات", mean: "Kuda Perang", juz: 30, v: [
            ["وَالْعَادِيَاتِ ضَبْحًا", "Demi kuda perang yang berlari kencang terengah-engah,"],
            ["فَالْمُورِيَاتِ قَدْحًا", "dan kuda yang memercikkan bunga api (dengan pukulan kuku kakinya),"],
            ["فَالْمُغِيرَاتِ صُبْحًا", "dan kuda yang menyerang dengan tiba-tiba pada waktu pagi,"],
            ["فَأَثَرْنَ بِهِ نَقْعًا", "sehingga menerbangkan debu,"],
            ["فَوَسَطْنَ بِهِ جَمْعًا", "lalu menyerbu ke tengah-tengah kumpulan musuh,"],
            ["إِنَّ الْإِنسَانَ لِرَبِّهِ لَكَنُودٌ", "sungguh, manusia itu sangat ingkar (tidak bersyukur) kepada Tuhannya,"],
            ["وَإِنَّهُ عَلَىٰ ذَٰلِكَ لَشَهِيدٌ", "dan sesungguhnya dia (manusia) menyaksikan (sendiri) keingkarannya,"],
            ["وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ", "dan sesungguhnya cintanya kepada harta benar-benar berlebihan."],
            ["أَفَلَا يَعْلَمُ إِذَا بُعْثِرَ مَا فِي الْقُبُورِ", "Maka tidakkah dia mengetahui apabila apa yang di dalam kubur dikeluarkan,"],
            ["وَحُصِّلَ مَا فِي الصُّدُورِ", "dan apa yang tersimpan di dalam dada dilahirkan?"],
            ["إِنَّ رَبَّهُم بِهِمْ يَوْمَئِذٍ لَّخَبِيرٌ", "Sungguh, Tuhan mereka pada hari itu Mahateliti terhadap keadaan mereka."]
        ] },
    { no: 99, name: "Az-Zalzalah", ar: "الزلزلة", mean: "Guncangan", juz: 30, v: [
            ["إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا", "Apabila bumi digoncangkan dengan goncangan yang dahsyat,"],
            ["وَأَخْرَجَتِ الْأَرْضُ أَثْقَالَهَا", "dan bumi telah mengeluarkan beban-beban berat (yang dikandung)nya,"],
            ["وَقَالَ الْإِنسَانُ مَا لَهَا", "dan manusia bertanya, “Apa yang terjadi pada bumi ini?”"],
            ["يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا", "pada hari itu bumi menyampaikan beritanya,"],
            ["بِأَنَّ رَبَّكَ أَوْحَىٰ لَهَا", "karena sesungguhnya Tuhanmu telah memerintahkan (yang demikian itu) kepadanya."],
            ["يَوْمَئِذٍ يَصْدُرُ النَّاسُ أَشْتَاتًا لِّيُرَوْا أَعْمَالَهُمْ", "Pada hari itu manusia keluar dari kuburnya dalam keadaan berkelompok-kelompok, untuk diperlihatkan kepada mereka (balasan) segala perbuatannya."],
            ["فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", "Maka barang siapa mengerjakan kebaikan seberat zarrah, niscaya dia akan melihat (balasan)nya."],
            ["وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ", "Dan barang siapa mengerjakan kejahatan seberat zarrah, niscaya dia akan melihat (balasan)nya pula."]
        ] },
    { no: 97, name: "Al-Qadr", ar: "القدر", mean: "Kemuliaan", juz: 30, v: [
            ["إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ", "Sesungguhnya Kami telah menurunkannya (Al-Qur'an) pada malam qadar."],
            ["وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ", "Dan tahukah kamu apakah malam kemuliaan itu?"],
            ["لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ", "Malam kemuliaan itu lebih baik daripada seribu bulan."],
            ["تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ", "Pada malam itu turun para malaikat dan Rūḥ (Jibril) dengan izin Tuhannya untuk mengatur semua urusan."],
            ["سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ", "Sejahteralah (malam) itu sampai terbit fajar."]
        ] },
    { no: 96, name: "Al-Alaq", ar: "العلق", mean: "Segumpal Darah (ayat 1-5)", juz: 30, v: [
            ["اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ", "Bacalah dengan (menyebut) nama Tuhanmu yang menciptakan,"],
            ["خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ", "Dia telah menciptakan manusia dari segumpal darah."],
            ["اقْرَأْ وَرَبُّكَ الْأَكْرَمُ", "Bacalah, dan Tuhanmulah Yang Mahamulia,"],
            ["الَّذِي عَلَّمَ بِالْقَلَمِ", "yang mengajar (manusia) dengan pena."],
            ["عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ", "Dia mengajarkan manusia apa yang tidak diketahuinya."]
        ] },
    { no: 95, name: "At-Tin", ar: "التين", mean: "Buah Tin", juz: 30, v: [
            ["وَالتِّينِ وَالزَّيْتُونِ", "Demi (buah) Tin dan (buah) Zaitun,"],
            ["وَطُورِ سِينِينَ", "demi gunung Sinai,"],
            ["وَهَٰذَا الْبَلَدِ الْأَمِينِ", "dan demi negeri (Mekah) yang aman ini."],
            ["لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ", "Sungguh, Kami telah menciptakan manusia dalam bentuk yang sebaik-baiknya."],
            ["ثُمَّ رَدَدْنَاهُ أَسْفَلَ سَافِلِينَ", "Kemudian Kami kembalikan dia ke tempat yang serendah-rendahnya (neraka),"],
            ["إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ فَلَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ", "kecuali orang-orang yang beriman dan mengerjakan kebajikan; maka mereka akan mendapat pahala yang tidak ada putus-putusnya."],
            ["فَمَا يُكَذِّبُكَ بَعْدُ بِالدِّينِ", "Maka apa yang menyebabkan engkau (orang kafir) mendustakan hari pembalasan setelah (adanya keterangan) itu?"],
            ["أَلَيْسَ اللَّهُ بِأَحْكَمِ الْحَاكِمِينَ", "Bukankah Allah hakim yang paling adil?"]
        ] },
    { no: 94, name: "Al-Insyirah", ar: "الشرح", mean: "Kelapangan", juz: 30, v: [
            ["أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ", "Bukankah Kami telah melapangkan dadamu (Muhammad)?"],
            ["وَوَضَعْنَا عَنكَ وِزْرَكَ", "dan Kami pun telah menurunkan bebanmu darimu,"],
            ["الَّذِي أَنقَضَ ظَهْرَكَ", "yang memberatkan punggungmu?"],
            ["وَرَفَعْنَا لَكَ ذِكْرَكَ", "Dan Kami tinggikan sebutan (nama)mu bagimu."],
            ["فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", "Maka sesungguhnya beserta kesulitan ada kemudahan,"],
            ["إِنَّ مَعَ الْعُسْرِ يُسْرًا", "sesungguhnya beserta kesulitan ada kemudahan."],
            ["فَإِذَا فَرَغْتَ فَانصَبْ", "Maka apabila engkau telah selesai (dari sesuatu urusan), tetaplah bekerja keras (untuk urusan yang lain),"],
            ["وَإِلَىٰ رَبِّكَ فَارْغَب", "dan hanya kepada Tuhanmulah engkau berharap."]
        ] },
    { no: 93, name: "Ad-Duha", ar: "الضحى", mean: "Waktu Duha", juz: 30, v: [
            ["وَالضُّحَىٰ", "Demi waktu duha (ketika matahari naik sepenggalah),"],
            ["وَاللَّيْلِ إِذَا سَجَىٰ", "demi malam apabila telah sunyi,"],
            ["مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", "Tuhanmu tidak meninggalkan engkau (Muhammad) dan tidak (pula) membencimu,"],
            ["وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ", "dan sungguh, yang kemudian itu lebih baik bagimu daripada yang permulaan."],
            ["وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", "Dan sungguh, kelak Tuhanmu pasti memberikan karunia-Nya kepadamu sehingga engkau menjadi puas."],
            ["أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ", "Bukankah Dia mendapatimu sebagai seorang yatim, lalu Dia melindungimu?"],
            ["وَوَجَدَكَ ضَالًّا فَهَدَىٰ", "Dan Dia mendapatimu sebagai seorang yang bingung, lalu Dia memberikan petunjuk,"],
            ["وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ", "dan Dia mendapatimu sebagai seorang yang kekurangan, lalu Dia memberikan kecukupan."],
            ["فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ", "Maka terhadap anak yatim janganlah engkau berlaku sewenang-wenang."],
            ["وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ", "Dan terhadap orang yang meminta-minta janganlah engkau menghardik(nya)."],
            ["وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ", "Dan terhadap nikmat Tuhanmu, hendaklah engkau menyebutnya (dengan bersyukur)."]
        ] },
    /* ---------------------------- JUZ 29 ---------------------------- */
    { no: 67, name: "Al-Mulk", ar: "الملك", mean: "Kerajaan (ayat 1-5)", juz: 29, v: [
            ["تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", "Mahasuci Allah yang di tangan-Nyalah segala kerajaan, dan Dia Mahakuasa atas segala sesuatu,"],
            ["الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ", "yang menciptakan mati dan hidup, untuk menguji kamu, siapa di antara kamu yang lebih baik amalnya. Dan Dia Mahaperkasa, Maha Pengampun,"],
            ["الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ", "yang menciptakan tujuh langit berlapis-lapis. Kamu tidak akan melihat sesuatu yang tidak seimbang pada ciptaan Tuhan Yang Maha Pengasih. Maka lihatlah berulang-ulang, adakah kamu melihat sesuatu yang cacat?"],
            ["ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", "Kemudian pandanglah sekali lagi, niscaya pandanganmu akan kembali kepadamu dengan tidak menemukan cacat dan ia (pandangan itu) dalam keadaan letih."],
            ["وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ", "Dan sungguh, Kami telah menghiasi langit yang dekat dengan bintang-bintang dan Kami jadikannya (bintang-bintang itu) sebagai alat-alat pelempar setan, dan Kami sediakan bagi mereka azab neraka yang menyala-nyala."]
        ] },
    { no: 68, name: "Al-Qalam", ar: "القلم", mean: "Pena (ayat 1-4)", juz: 29, v: [
            ["ن ۚ وَالْقَلَمِ وَمَا يَسْطُرُونَ", "Nun. Demi pena dan apa yang mereka tuliskan,"],
            ["مَا أَنتَ بِنِعْمَةِ رَبِّكَ بِمَجْنُونٍ", "berkat nikmat Tuhanmu engkau (Muhammad) bukanlah orang gila."],
            ["وَإِنَّ لَكَ لَأَجْرًا غَيْرَ مَمْنُونٍ", "Dan sungguh, engkau pasti mendapat pahala yang besar yang tidak putus-putusnya."],
            ["وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ", "Dan sesungguhnya engkau benar-benar berbudi pekerti yang agung."]
        ] },
    { no: 73, name: "Al-Muzzammil", ar: "المزمل", mean: "Orang Berselimut (ayat 1-4)", juz: 29, v: [
            ["يَا أَيُّهَا الْمُزَّمِّلُ", "Wahai orang yang berselimut (Muhammad)!"],
            ["قُمِ اللَّيْلَ إِلَّا قَلِيلًا", "bangunlah (untuk salat) pada malam hari, kecuali sebagian kecil,"],
            ["نِّصْفَهُ أَوِ انقُصْ مِنْهُ قَلِيلًا", "(yaitu) separuhnya atau kurangi sedikit dari seperdua itu,"],
            ["أَوْ زِدْ عَلَيْهِ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا", "atau lebih dari (seperdua) itu, dan bacalah Al-Qur'an itu dengan perlahan-lahan."]
        ] },
    { no: 74, name: "Al-Muddatsir", ar: "المدثر", mean: "Orang Berkemul (ayat 1-7)", juz: 29, v: [
            ["يَا أَيُّهَا الْمُدَّثِّرُ", "Wahai orang yang berkemul (berselimut)!"],
            ["قُمْ فَأَنذِرْ", "bangunlah, lalu berilah peringatan!"],
            ["وَرَبَّكَ فَكَبِّرْ", "dan agungkanlah Tuhanmu,"],
            ["وَثِيَابَكَ فَطَهِّرْ", "dan bersihkanlah pakaianmu,"],
            ["وَالرُّجْزَ فَاهْجُرْ", "dan tinggalkanlah segala (perbuatan) yang keji,"],
            ["وَلَا تَمْنُن تَسْتَكْثِرُ", "dan janganlah engkau (Muhammad) memberi (dengan maksud) memperoleh (balasan) yang lebih banyak."],
            ["وَلِرَبِّكَ فَاصْبِرْ", "Dan karena Tuhanmu, bersabarlah."]
        ] },
    /* ---------------------------- JUZ 28 ---------------------------- */
    { no: 59, name: "Al-Hasyr", ar: "الحشر", mean: "Pengusiran (ayat 22-24)", juz: 28, from: 22, v: [
            ["هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ ۖ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ ۖ هُوَ الرَّحْمَٰنُ الرَّحِيمُ", "Dialah Allah, tidak ada tuhan selain Dia. Yang Mengetahui yang gaib dan yang nyata. Dialah Yang Maha Pengasih, Maha Penyayang."],
            ["هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ ۚ سُبْحَانَ اللَّهِ عَمَّا يُشْرِكُونَ", "Dialah Allah, tidak ada tuhan selain Dia. Raja, Yang Mahasuci, Yang Mahasejahtera, Yang Menjaga Keamanan, Pemelihara Keselamatan, Yang Mahaperkasa, Yang Mahakuasa, Yang Memiliki Segala Keagungan. Mahasuci Allah dari apa yang mereka persekutukan."],
            ["هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ ۖ لَهُ الْأَسْمَاءُ الْحُسْنَىٰ ۚ يُسَبِّحُ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ", "Dialah Allah Yang Menciptakan, Yang Mengadakan, Yang Membentuk Rupa, Dia memiliki nama-nama yang indah. Apa yang di langit dan di bumi bertasbih kepada-Nya. Dan Dialah Yang Mahaperkasa, Mahabijaksana."]
        ] },
    { no: 61, name: "As-Saff", ar: "الصف", mean: "Barisan (ayat 1-3)", juz: 28, v: [
            ["سَبَّحَ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۖ وَهُوَ الْعَزِيزُ الْحَكِيمُ", "Apa yang di langit dan apa yang di bumi bertasbih kepada Allah; dan Dialah Yang Mahaperkasa, Mahabijaksana."],
            ["يَا أَيُّهَا الَّذِينَ آمَنُوا لِمَ تَقُولُونَ مَا لَا تَفْعَلُونَ", "Wahai orang-orang yang beriman! Mengapa kamu mengatakan sesuatu yang tidak kamu kerjakan?"],
            ["كَبُرَ مَقْتًا عِندَ اللَّهِ أَن تَقُولُوا مَا لَا تَفْعَلُونَ", "(Itu) sangatlah dibenci di sisi Allah jika kamu mengatakan apa yang tidak kamu kerjakan."]
        ] },
    { no: 62, name: "Al-Jumu'ah", ar: "الجمعة", mean: "Hari Jumat (ayat 1-4)", juz: 28, v: [
            ["يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ الْمَلِكِ الْقُدُّوسِ الْعَزِيزِ الْحَكِيمِ", "Apa yang ada di langit dan apa yang ada di bumi senantiasa bertasbih kepada Allah, Raja, Yang Mahasuci, Yang Mahaperkasa, Mahabijaksana."],
            ["هُوَ الَّذِي بَعَثَ فِي الْأُمِّيِّينَ رَسُولًا مِّنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِهِ وَيُزَكِّيهِمْ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ وَإِن كَانُوا مِن قَبْلُ لَفِي ضَلَالٍ مُّبِينٍ", "Dialah yang mengutus seorang Rasul kepada kaum yang buta huruf dari kalangan mereka sendiri, yang membacakan ayat-ayat-Nya kepada mereka, menyucikan (jiwa) mereka, dan mengajarkan kepada mereka Kitab dan Hikmah (Sunnah), meskipun sebelumnya mereka benar-benar berada dalam kesesatan yang nyata,"],
            ["وَآخَرِينَ مِنْهُمْ لَمَّا يَلْحَقُوا بِهِمْ ۚ وَهُوَ الْعَزِيزُ الْحَكِيمُ", "dan (juga) kepada kaum yang lain dari mereka yang belum berhubungan dengan mereka. Dan Dialah Yang Mahaperkasa, Mahabijaksana."],
            ["ذَٰلِكَ فَضْلُ اللَّهِ يُؤْتِيهِ مَن يَشَاءُ ۚ وَاللَّهُ ذُو الْفَضْلِ الْعَظِيمِ", "Demikianlah karunia Allah, diberikan-Nya kepada siapa yang Dia kehendaki. Dan Allah memiliki karunia yang besar."]
        ] }
];
