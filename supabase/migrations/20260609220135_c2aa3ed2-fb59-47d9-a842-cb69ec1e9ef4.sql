
CREATE TABLE public.site_content (
  lang text PRIMARY KEY CHECK (lang IN ('ar','fr','en')),
  content jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY site_content_public_read
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

-- Arabic
INSERT INTO public.site_content (lang, content) VALUES ('ar', '{
  "dir": "rtl",
  "brand": "HN-DB",
  "nav": {"home":"الرئيسية","features":"الميزات","pricing":"الأسعار","docs":"الوثائق","contact":"تواصل معنا","login":"دخول","dashboard":"لوحة التحكم"},
  "hero": {
    "titleLines": [
      [{"text":"منصة متكاملة","emph":false}],
      [{"text":"لإدارة ","emph":false},{"text":"قواعد البيانات","emph":true}],
      [{"text":"والتخزين ","emph":false},{"text":"السحابي","emph":true}]
    ],
    "subtitle": "حلول قوية وآمنة لإدارة بياناتك وتخزين ملفاتك بأعلى مستويات الأداء والموثوقية",
    "ctaStart": "ابدأ الآن",
    "ctaFeatures": "استكشف الميزات",
    "scrollHint": "اسحب للأسفل للاستكشاف"
  },
  "stats": [
    {"t":"أمان متقدم","d":"حماية بياناتك بأحدث تقنيات التشفير AES-256"},
    {"t":"تخزين سحابي","d":"الوصول إلى ملفاتك من أي مكان بأمان تام"},
    {"t":"قواعد بيانات قوية","d":"أداء عالي وقابلية توسع لا محدودة"},
    {"t":"أداء عالي","d":"استجابة فورية وسرعة فائقة"}
  ],
  "features": {
    "eyebrow":"الميزات",
    "title":"كل ما تحتاجه لإدارة بنيتك التحتية",
    "subtitle":"أدوات مصممة للمحترفين، بواجهة بسيطة وأمان على مستوى المؤسسات.",
    "items":[
      {"icon":"database","t":"قواعد بيانات مركزية","d":"أدِر كل قواعد بياناتك من واجهة واحدة موحدة."},
      {"icon":"shield","t":"تشفير AES-256","d":"حماية كاملة لبياناتك أثناء النقل والتخزين."},
      {"icon":"cloud","t":"تخزين سحابي مرن","d":"تخزين ملفاتك ونسخك الاحتياطية في السحابة."},
      {"icon":"activity","t":"مراقبة لحظية","d":"تتبّع الأداء والحالة الصحية على مدار الساعة."},
      {"icon":"zap","t":"أداء عالي","d":"بنية محسّنة لاستجابة سريعة وتوسّع تلقائي."},
      {"icon":"lock","t":"صلاحيات دقيقة","d":"تحكم كامل في من يصل إلى ماذا، ومتى."}
    ]
  },
  "pricing": {
    "eyebrow":"الأسعار",
    "title":"خطط مرنة تناسب احتياجك",
    "subtitle":"ابدأ مجاناً وتوسّع عندما تكون جاهزاً.",
    "ctaSelect":"اختر هذه الخطة",
    "plans":[
      {"name":"البداية","price":"مجاناً","features":["قاعدة بيانات واحدة","1 GB تخزين","نسخ احتياطي يومي"]},
      {"name":"احترافي","price":"$19/شهر","featured":true,"features":["10 قواعد بيانات","100 GB تخزين","مراقبة لحظية","دعم أولوية"]},
      {"name":"المؤسسات","price":"تواصل معنا","features":["غير محدود","SLA مخصّص","إدارة فِرَق","أمان متقدم"]}
    ]
  },
  "docs": {
    "eyebrow":"الوثائق",
    "title":"ابدأ بسرعة مع HN-DB",
    "subtitle":"دليل مفصّل لكل ميزة، مع أمثلة جاهزة.",
    "sections":[
      {"t":"كيف يعمل؟","body":"HN-DB يعمل كوسيط آمن بين مواقعك وقواعد البيانات. اربط موقعك مرة واحدة، وأدر كل شيء من لوحة واحدة."},
      {"t":"ربط موقع PHP / Node / Python","body":"استخدم مفتاح API الخاص بمشروعك لإجراء طلبات HTTPS مباشرة إلى /api/public/site-config مع تمرير الدومين."},
      {"t":"المصادقة الموحدة (SSO)","body":"كل مستخدم في HN-DB يحصل على جلسة موحدة. استخدم Bearer token لاستدعاء وظائف الخادم المحمية."},
      {"t":"رفع ملفات للتخزين","body":"ارفع APK / AAB أو نسخك الاحتياطية إلى bucket app-releases. يتم توليد روابط موقّعة لمدة ساعة."},
      {"t":"نشر على VPS","body":"راجع ملف DEPLOYMENT.md داخل المشروع للحصول على دليل البناء والتشغيل على سيرفر محلي أو VPS."}
    ]
  },
  "contact": {
    "eyebrow":"تواصل معنا",
    "title":"نحن هنا لمساعدتك",
    "subtitle":"اختر الطريقة الأنسب لك للتواصل مع فريقنا.",
    "channels":[
      {"icon":"mail","t":"البريد الإلكتروني","d":"support@hn-db.app","href":"mailto:support@hn-db.app"},
      {"icon":"chat","t":"الدردشة المباشرة","d":"متاحة من 9 صباحاً إلى 6 مساءً","href":"#"},
      {"icon":"github","t":"GitHub","d":"بلّغ عن مشكلة أو اقترح ميزة","href":"#"}
    ]
  },
  "footer":"جميع الحقوق محفوظة"
}'::jsonb);

-- French
INSERT INTO public.site_content (lang, content) VALUES ('fr', '{
  "dir": "ltr",
  "brand": "HN-DB",
  "nav": {"home":"Accueil","features":"Fonctionnalités","pricing":"Tarifs","docs":"Documentation","contact":"Contact","login":"Connexion","dashboard":"Tableau de bord"},
  "hero": {
    "titleLines": [
      [{"text":"Plateforme intégrée","emph":false}],
      [{"text":"pour gérer vos ","emph":false},{"text":"bases de données","emph":true}],
      [{"text":"et votre ","emph":false},{"text":"stockage cloud","emph":true}]
    ],
    "subtitle": "Des solutions puissantes et sécurisées pour gérer vos données et fichiers avec performance et fiabilité.",
    "ctaStart": "Commencer",
    "ctaFeatures": "Explorer les fonctionnalités",
    "scrollHint": "Faites défiler pour explorer"
  },
  "stats": [
    {"t":"Sécurité avancée","d":"Vos données protégées par le chiffrement AES-256"},
    {"t":"Stockage cloud","d":"Accédez à vos fichiers de partout en toute sécurité"},
    {"t":"Bases de données puissantes","d":"Hautes performances et évolutivité illimitée"},
    {"t":"Performance élevée","d":"Réponse instantanée et vitesse maximale"}
  ],
  "features": {
    "eyebrow":"Fonctionnalités",
    "title":"Tout ce dont vous avez besoin pour gérer votre infrastructure",
    "subtitle":"Des outils conçus pour les professionnels, avec une interface simple et une sécurité de niveau entreprise.",
    "items":[
      {"icon":"database","t":"Bases de données centralisées","d":"Gérez toutes vos bases depuis une seule interface unifiée."},
      {"icon":"shield","t":"Chiffrement AES-256","d":"Protection complète de vos données en transit et au repos."},
      {"icon":"cloud","t":"Stockage cloud flexible","d":"Stockez vos fichiers et sauvegardes dans le cloud."},
      {"icon":"activity","t":"Monitoring en temps réel","d":"Suivez les performances et l''état 24h/24."},
      {"icon":"zap","t":"Haute performance","d":"Architecture optimisée pour une réponse rapide et un auto-scaling."},
      {"icon":"lock","t":"Permissions granulaires","d":"Contrôlez précisément qui accède à quoi et quand."}
    ]
  },
  "pricing": {
    "eyebrow":"Tarifs",
    "title":"Des plans flexibles adaptés à vos besoins",
    "subtitle":"Commencez gratuitement et évoluez quand vous êtes prêt.",
    "ctaSelect":"Choisir ce plan",
    "plans":[
      {"name":"Démarrage","price":"Gratuit","features":["1 base de données","1 Go de stockage","Sauvegarde quotidienne"]},
      {"name":"Pro","price":"19$/mois","featured":true,"features":["10 bases de données","100 Go de stockage","Monitoring temps réel","Support prioritaire"]},
      {"name":"Entreprise","price":"Nous contacter","features":["Illimité","SLA personnalisé","Gestion d''équipes","Sécurité avancée"]}
    ]
  },
  "docs": {
    "eyebrow":"Documentation",
    "title":"Démarrez rapidement avec HN-DB",
    "subtitle":"Guide détaillé pour chaque fonctionnalité, avec des exemples prêts à l''emploi.",
    "sections":[
      {"t":"Comment ça marche ?","body":"HN-DB agit comme intermédiaire sécurisé entre vos sites et vos bases de données. Connectez votre site une fois et gérez tout depuis un seul tableau de bord."},
      {"t":"Connecter un site PHP / Node / Python","body":"Utilisez la clé API de votre projet pour effectuer des requêtes HTTPS directement vers /api/public/site-config en passant le domaine."},
      {"t":"Authentification unifiée (SSO)","body":"Chaque utilisateur HN-DB obtient une session unifiée. Utilisez le Bearer token pour appeler les fonctions serveur protégées."},
      {"t":"Uploader des fichiers","body":"Téléversez APK / AAB ou sauvegardes dans le bucket app-releases. Des URLs signées d''1h sont générées."},
      {"t":"Déployer sur un VPS","body":"Consultez DEPLOYMENT.md dans le projet pour le guide de build et de lancement sur serveur local ou VPS."}
    ]
  },
  "contact": {
    "eyebrow":"Contact",
    "title":"Nous sommes là pour vous aider",
    "subtitle":"Choisissez la méthode qui vous convient pour contacter notre équipe.",
    "channels":[
      {"icon":"mail","t":"Email","d":"support@hn-db.app","href":"mailto:support@hn-db.app"},
      {"icon":"chat","t":"Chat en direct","d":"Disponible de 9h à 18h","href":"#"},
      {"icon":"github","t":"GitHub","d":"Signalez un bug ou suggérez une fonctionnalité","href":"#"}
    ]
  },
  "footer":"Tous droits réservés"
}'::jsonb);

-- English
INSERT INTO public.site_content (lang, content) VALUES ('en', '{
  "dir": "ltr",
  "brand": "HN-DB",
  "nav": {"home":"Home","features":"Features","pricing":"Pricing","docs":"Docs","contact":"Contact","login":"Sign in","dashboard":"Dashboard"},
  "hero": {
    "titleLines": [
      [{"text":"All-in-one platform","emph":false}],
      [{"text":"to manage your ","emph":false},{"text":"databases","emph":true}],
      [{"text":"and ","emph":false},{"text":"cloud storage","emph":true}]
    ],
    "subtitle": "Powerful, secure solutions to manage your data and files with top-tier performance and reliability.",
    "ctaStart": "Get started",
    "ctaFeatures": "Explore features",
    "scrollHint": "Scroll to explore"
  },
  "stats": [
    {"t":"Advanced security","d":"Your data protected with AES-256 encryption"},
    {"t":"Cloud storage","d":"Access your files from anywhere, safely"},
    {"t":"Powerful databases","d":"High performance and unlimited scalability"},
    {"t":"High performance","d":"Instant response and blazing speed"}
  ],
  "features": {
    "eyebrow":"Features",
    "title":"Everything you need to run your infrastructure",
    "subtitle":"Tools built for pros, with a simple interface and enterprise-grade security.",
    "items":[
      {"icon":"database","t":"Centralized databases","d":"Manage all your databases from one unified panel."},
      {"icon":"shield","t":"AES-256 encryption","d":"Full protection for data in transit and at rest."},
      {"icon":"cloud","t":"Flexible cloud storage","d":"Store your files and backups in the cloud."},
      {"icon":"activity","t":"Real-time monitoring","d":"Track performance and health 24/7."},
      {"icon":"zap","t":"High performance","d":"Optimized architecture for quick response and auto-scaling."},
      {"icon":"lock","t":"Fine-grained permissions","d":"Control exactly who accesses what, and when."}
    ]
  },
  "pricing": {
    "eyebrow":"Pricing",
    "title":"Flexible plans for every need",
    "subtitle":"Start free and scale when you are ready.",
    "ctaSelect":"Choose this plan",
    "plans":[
      {"name":"Starter","price":"Free","features":["1 database","1 GB storage","Daily backup"]},
      {"name":"Pro","price":"$19/mo","featured":true,"features":["10 databases","100 GB storage","Real-time monitoring","Priority support"]},
      {"name":"Enterprise","price":"Contact us","features":["Unlimited","Custom SLA","Team management","Advanced security"]}
    ]
  },
  "docs": {
    "eyebrow":"Docs",
    "title":"Get started fast with HN-DB",
    "subtitle":"Clear guide for every feature, with ready examples.",
    "sections":[
      {"t":"How does it work?","body":"HN-DB acts as a secure proxy between your sites and your databases. Connect once and manage everything from a single dashboard."},
      {"t":"Connect a PHP / Node / Python site","body":"Use your project API key to call HTTPS requests directly against /api/public/site-config passing your domain."},
      {"t":"Single sign-on (SSO)","body":"Every HN-DB user gets a unified session. Use the Bearer token to call protected server functions."},
      {"t":"Upload files","body":"Upload APK / AAB or backups to the app-releases bucket. Signed URLs are generated for 1 hour."},
      {"t":"Deploy on a VPS","body":"See DEPLOYMENT.md in the project for the build and run guide on local server or VPS."}
    ]
  },
  "contact": {
    "eyebrow":"Contact",
    "title":"We are here to help",
    "subtitle":"Pick the channel that works best for you.",
    "channels":[
      {"icon":"mail","t":"Email","d":"support@hn-db.app","href":"mailto:support@hn-db.app"},
      {"icon":"chat","t":"Live chat","d":"Available 9am to 6pm","href":"#"},
      {"icon":"github","t":"GitHub","d":"Report a bug or suggest a feature","href":"#"}
    ]
  },
  "footer":"All rights reserved"
}'::jsonb);
