import type { DocumentSlug } from "./consent";
import { DOCUMENT_VERSIONS } from "./consent";
import type { Locale } from "./i18n";

/**
 * Bilingual content map for the six legal documents.
 *
 * A licensed Saudi lawyer's revisions to any document are a content edit
 * here — do not push the copy elsewhere. `version` is imported from
 * lib/consent.ts so updates to the version bump automatically re-prompt
 * users to re-consent. The Arabic text is the authoritative source; the
 * English text is a convenience translation (see the notice rendered by
 * LegalArticle) and must be kept in sync whenever the Arabic changes.
 */

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDoc = {
  slug: DocumentSlug;
  title: string;
  eyebrow: string;
  intro: string;
  sections: LegalSection[];
  closing?: {
    heading: string;
    paragraphs: string[];
  };
};

const jurisdictionClosingAr = {
  heading: "الاختصاص القضائي",
  paragraphs: [
    "تخضع هذه الاتفاقية للأنظمة السارية في المملكة العربية السعودية، وتختص المحاكم السعودية المختصة في مدينة الرياض بالنظر في أي نزاع.",
    "قبل اللجوء إلى القضاء، يلتزم الطرفان بالسعي لتسوية النزاع وديًا خلال مدة لا تزيد عن ثلاثين (٣٠) يومًا من تاريخ الإخطار.",
    "للتواصل النظامي: legal@aqarmudar.sa — شركة بصير لتقنية المعلومات، الرقم الموحد ٧٠٠٥٧١٠٤٤٢.",
  ],
};

const jurisdictionClosingEn = {
  heading: "Governing law & jurisdiction",
  paragraphs: [
    "This agreement is governed by the laws in force in the Kingdom of Saudi Arabia, and the competent Saudi courts in the city of Riyadh have jurisdiction over any dispute.",
    "Before resorting to litigation, both parties undertake to seek an amicable settlement of the dispute within a period not exceeding thirty (30) days from the date of notice.",
    "For legal correspondence: legal@aqarmudar.sa — Bassir Technology Information Company, Unified No. 7005710442.",
  ],
};

export const LEGAL_DOCS: Record<Locale, Record<DocumentSlug, LegalDoc>> = {
  ar: {
    terms: {
      slug: "terms",
      title: "الشروط والأحكام",
      eyebrow: "المستندات النظامية",
      intro:
        "تحكم هذه الشروط والأحكام استخدامك لمنصة «عقار مدر» (المشغّلة من قِبل شركة بصير لتقنية المعلومات). باستخدامك للمنصة فإنك توافق على الالتزام بها بالكامل.",
      sections: [
        {
          heading: "طبيعة الخدمة",
          paragraphs: [
            "تُقدّم المنصة خدمات عرض العقارات وربط الملّاك بالمستثمرين والمشترين، إضافة إلى إتاحة تقارير هندسية معتمدة (Alarrab Certified) ودراسات تطوير عقاري.",
            "المنصة ليست طرفًا في أي عقد بيع أو شراء يُبرم بين المستخدمين، ولا تتحمّل مسؤولية صحة البيانات المقدَّمة من الملّاك خارج نطاق التقرير الهندسي المعتمد.",
          ],
        },
        {
          heading: "أهلية الاستخدام",
          bullets: [
            "يجب أن يكون المستخدم قد أتم ١٨ سنة ميلادية.",
            "يُشترط تقديم بيانات صحيحة وموثّقة عند التسجيل.",
            "للاستثمار، يُشترط التحقق من الهوية عبر نفاذ.",
          ],
        },
        {
          heading: "الحساب والأمان",
          paragraphs: [
            "المستخدم مسؤول عن حماية بيانات دخوله وتفعيل المصادقة الثنائية للحسابات التي تُجري معاملات مالية. أي نشاط عبر الحساب يُعدّ صادرًا عن صاحبه.",
          ],
        },
        {
          heading: "عرض العقارات",
          paragraphs: [
            "كل عقار يُنشر على المنصة يمر بمراجعة هندسية من Alarrab Engineering & Partner قبل النشر. المالك مسؤول عن دقة الوصف والمعلومات التجارية (السعر، النوع، الموقع).",
            "تحتفظ المنصة بحقّ رفض أو إزالة أي عقار لا يستوفي معايير الاعتماد.",
          ],
        },
        {
          heading: "الاستثمار العقاري",
          bullets: [
            "منتج البيع الجزئي يخضع للأطر التنظيمية السعودية ذات العلاقة وقد يتطلّب هيكلة عبر أدوات معتمدة (SPV أو صندوق عقاري).",
            "المستثمر يقرّ بأنه اطلع على التقرير الهندسي كاملًا ومستوى المخاطر المذكور.",
            "الأرقام والعوائد الواردة تقديرية وليست ضمانًا لعائد مستقبلي.",
          ],
        },
        {
          heading: "الرسوم والفوترة",
          paragraphs: [
            "قد تفرض المنصة عمولات أو رسومًا على المعاملات، ويُفصح عنها بوضوح قبل إتمام العملية. الرسوم شاملة لضريبة القيمة المضافة وفق النظام السعودي.",
          ],
        },
        {
          heading: "الملكية الفكرية",
          paragraphs: [
            "جميع محتويات المنصة (شعار، تصميم، كود، تقارير) ملكية فكرية محفوظة لشركة بصير لتقنية المعلومات وشركائها. يُحظر إعادة استخدامها دون إذن كتابي.",
          ],
        },
        {
          heading: "حدود المسؤولية",
          paragraphs: [
            "المنصة لا تضمن دقة تقديرات القيمة السوقية أو العوائد المستقبلية. الاستثمار العقاري ينطوي على مخاطر، والمستثمر يتحمّل قراراته الاستثمارية.",
          ],
        },
        {
          heading: "إنهاء الحساب",
          paragraphs: [
            "يحق للمنصة تعليق أو إنهاء أي حساب في حال مخالفة الشروط، أو الاشتباه بنشاط احتيالي، أو الإخلال بمتطلبات مكافحة غسل الأموال.",
          ],
        },
        {
          heading: "التعديلات",
          paragraphs: [
            "يحق للمنصة تعديل هذه الشروط، ويُخطر المستخدم بأي تعديل جوهري عبر البريد أو إشعار داخل المنصة، وقد يُطلب منه إعادة الموافقة.",
          ],
        },
        {
          heading: "التواصل النظامي",
          paragraphs: ["legal@aqarmudar.sa"],
        },
      ],
      closing: jurisdictionClosingAr,
    },

    privacy: {
      slug: "privacy",
      title: "سياسة الخصوصية — PDPL",
      eyebrow: "حماية البيانات الشخصية",
      intro:
        "تلتزم منصة «عقار مدر» بنظام حماية البيانات الشخصية السعودي (PDPL) الصادر عن الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA). توضح هذه السياسة أنواع البيانات التي نجمعها وكيفية استخدامها وحمايتها.",
      sections: [
        {
          heading: "البيانات التي نجمعها",
          bullets: [
            "بيانات الهوية: الاسم، البريد، الجوال، ورقم الهوية (عند التحقق عبر نفاذ).",
            "بيانات المعاملات: العقارات المعروضة، الاستثمارات، والاستفسارات.",
            "بيانات تقنية: عنوان IP، نوع الجهاز، وسجلات الاستخدام.",
            "بيانات الدفع: تُعالج عبر بوابات مرخّصة (Moyasar / Stripe) ولا نخزّن أرقام البطاقات.",
          ],
        },
        {
          heading: "أساس المعالجة",
          paragraphs: [
            "نعالج بياناتك بموجب: (أ) موافقتك الصريحة، (ب) تنفيذ عقد الخدمة، (ج) الالتزام بمتطلبات نظامية، (د) المصلحة المشروعة لتحسين الخدمة ومنع الاحتيال.",
          ],
        },
        {
          heading: "استخدامات البيانات",
          bullets: [
            "إنشاء الحساب والتحقق من الهوية.",
            "عرض العقارات وربط الأطراف.",
            "معالجة المدفوعات والاستثمارات.",
            "إشعارات الحساب والفواتير.",
            "تحسين المنصة ومنع الاحتيال.",
          ],
        },
        {
          heading: "مشاركة البيانات",
          paragraphs: [
            "لا نبيع بياناتك. قد نشاركها فقط مع: الاستشاري الهندسي (Alarrab) لإصدار التقرير، مقاول التطوير (Azoom) عند طلب دراسة تطوير، بوابات الدفع لإتمام المعاملة، والجهات التنظيمية عند الطلب النظامي (SAMA، CMA، البلديات، ZATCA).",
          ],
        },
        {
          heading: "حقوقك",
          bullets: [
            "الوصول إلى بياناتك.",
            "تصحيح البيانات غير الدقيقة.",
            "حذف بياناتك (إلا ما يتطلب النظام حفظه).",
            "سحب موافقتك في أي وقت.",
            "تقييد المعالجة أو الاعتراض عليها.",
          ],
        },
        {
          heading: "مدة الاحتفاظ",
          paragraphs: [
            "نحتفظ بالبيانات طوال فترة نشاط الحساب، ثم لمدة إضافية وفق ما تتطلبه الأنظمة (حد أدنى ١٠ سنوات لسجلات المعاملات المالية).",
          ],
        },
        {
          heading: "النقل خارج المملكة",
          paragraphs: [
            "نلتزم بضوابط SDAIA بشأن نقل البيانات خارج المملكة. أي نقل يتم بضمانات ملائمة (Standard Contractual Clauses).",
          ],
        },
        {
          heading: "الأمن",
          paragraphs: [
            "تشفير TLS 1.2+ لجميع الاتصالات، تشفير كلمات المرور بـ bcrypt، سجلات تدقيق كاملة، مصادقة ثنائية اختيارية، وضوابط وصول متعددة الأدوار.",
          ],
        },
        {
          heading: "المسؤول عن حماية البيانات (DPO)",
          paragraphs: ["لممارسة حقوقك أو الإبلاغ عن حادثة: dpo@aqarmudar.sa"],
        },
      ],
      closing: jurisdictionClosingAr,
    },

    disclaimer: {
      slug: "disclaimer",
      title: "إخلاء المسؤولية",
      eyebrow: "المسؤولية والمخاطر",
      intro:
        "الاستثمار العقاري ينطوي على مخاطر. القرار الاستثماري مسؤولية شخصية، وهذه الوثيقة توضح حدود مسؤولية المنصة والأطراف المرتبطة بها.",
      sections: [
        {
          heading: "لا ضمان للعائد",
          paragraphs: [
            "جميع تقديرات العائد المتوقّع، فرص رفع القيمة، والعمر الافتراضي هي تقديرات هندسية مبنية على الحالة الحالية للعقار، وليست ضمانات لأي عائد مستقبلي. القيمة السوقية للعقارات قد ترتفع أو تنخفض.",
          ],
        },
        {
          heading: "التقرير الهندسي",
          paragraphs: [
            "التقرير الصادر من Alarrab Engineering & Partner يعتمد على معاينة ميدانية في تاريخ محدد، وقد تتغير حالة العقار لاحقًا. لا يُغني التقرير عن الفحص الشخصي أو الاستشارة القانونية عند البيع أو الشراء.",
          ],
        },
        {
          heading: "لا نصيحة مالية",
          paragraphs: [
            "محتوى المنصة معلوماتي، ولا يُعدّ استشارة مالية أو استثمارية أو ضريبية أو قانونية. يُنصح باستشارة مختصّ مرخّص قبل أي قرار استثماري كبير.",
          ],
        },
        {
          heading: "الهيكل القانوني للحصص",
          paragraphs: [
            "يتم تنظيم البيع الجزئي وفق الأطر القانونية السعودية المعتمدة (قد يشمل SPV أو صندوق عقاري أو أي هيكل ينظمه المشرّع). يجب على المستثمر مراجعة العقد النموذجي للحصة قبل الاستثمار.",
          ],
        },
        {
          heading: "الحد الأدنى للاستثمار",
          paragraphs: [
            "قد تفرض المنصة حدًا أدنى وأقصى للاستثمار في كل عقار وفق متطلبات مكافحة غسل الأموال والملاءة المالية للمستثمر.",
          ],
        },
        {
          heading: "المحتوى الإعلاني",
          paragraphs: [
            "أي محتوى تسويقي عن عقار على المنصة لا يُعدّ عرضًا نظاميًا. العرض النظامي يتم داخل المنصة وبعقود موثّقة.",
          ],
        },
        {
          heading: "القوة القاهرة",
          paragraphs: [
            "لا تتحمل المنصة مسؤولية أي إخلال ناتج عن ظروف خارجة عن سيطرتها (كوارث، حظر، توقف أنظمة تابعة لطرف ثالث).",
          ],
        },
      ],
      closing: jurisdictionClosingAr,
    },

    risk: {
      slug: "risk",
      title: "إفصاح مخاطر الاستثمار",
      eyebrow: "المخاطر الجوهرية",
      intro:
        "يوضح هذا الإفصاح المخاطر الجوهرية للاستثمار العقاري عبر منصة «عقار مدر». يجب قراءته قبل الاستثمار في أي عقار.",
      sections: [
        {
          heading: "مخاطر السوق",
          paragraphs: [
            "قد ترتفع أو تنخفض قيمة العقارات نتيجة لعوامل اقتصادية أو تنظيمية أو ديموغرافية خارجة عن سيطرة المنصة أو المالك.",
          ],
        },
        {
          heading: "مخاطر السيولة",
          paragraphs: [
            "الحصص في البيع الجزئي قد لا تكون قابلة للبيع فوريًا. قد تحتاج لوقت وسعر مناسب لبيع حصتك.",
          ],
        },
        {
          heading: "مخاطر المستأجر",
          paragraphs: [
            "العائد الإيجاري مرتبط بشغل العقار وتحصيل الإيجارات. قد يتوقف المستأجر عن السداد أو يخلي العقار.",
          ],
        },
        {
          heading: "مخاطر التطوير",
          paragraphs: [
            "عند تنفيذ دراسات تطوير أو ترميم، قد تتجاوز التكلفة الفعلية أو المدة التقديرات المذكورة في التقرير.",
          ],
        },
        {
          heading: "مخاطر التركّز",
          paragraphs: ["عدم تنويع المحفظة يزيد المخاطر. لا تستثمر أكثر مما يمكنك خسارته."],
        },
        {
          heading: "مخاطر تنظيمية",
          paragraphs: [
            "أي تغيير في أنظمة العقار، أو الاستثمار، أو الضرائب في المملكة قد يؤثر على أداء استثمارك.",
          ],
        },
        {
          heading: "مخاطر الطرف الثالث",
          paragraphs: [
            "المنصة تعتمد على أطراف ثالثة (بوابات دفع، مقاولين، مستشارين). إخفاق أي منها قد يؤثر على تنفيذ الخدمة.",
          ],
        },
        {
          heading: "تحذير",
          paragraphs: [
            "قد تخسر جزءًا أو كامل رأس المال المستثمر. الاستثمار العقاري قرار طويل الأجل وليس مضمونًا.",
          ],
        },
      ],
      closing: jurisdictionClosingAr,
    },

    aml: {
      slug: "aml",
      title: "مكافحة غسل الأموال ومعرفة العميل (AML / KYC)",
      eyebrow: "الالتزام والامتثال",
      intro:
        "تلتزم منصة «عقار مدر» بنظام مكافحة غسل الأموال الصادر بالمرسوم الملكي رقم م/٢٠، وأنظمة مكافحة تمويل الإرهاب، وتعليمات البنك المركزي السعودي (SAMA) وهيئة السوق المالية (CMA).",
      sections: [
        {
          heading: "اعرف عميلك (KYC)",
          bullets: [
            "التحقق من الهوية عبر نفاذ لجميع المستثمرين.",
            "التحقق من رقم الجوال عبر OTP.",
            "التحقق من البريد الإلكتروني.",
            "للاستثمارات فوق ٢٠٠٫٠٠٠ ر.س: مستندات إضافية (مصدر الأموال، إثبات دخل، تصنيف ائتماني).",
          ],
        },
        {
          heading: "المراقبة والإبلاغ",
          bullets: [
            "مراقبة المعاملات آليًا لرصد الأنماط المشبوهة.",
            "تصعيد المعاملات المشتبه بها للجنة الالتزام الداخلية.",
            "الإبلاغ الفوري للـ SAFIU عند وجود أي اشتباه.",
          ],
        },
        {
          heading: "الأشخاص الممنوعون",
          paragraphs: [
            "نرفض التعامل مع الأشخاص المدرجين في قوائم العقوبات المحلية والدولية (SAMA، OFAC، UN Sanctions).",
          ],
        },
        {
          heading: "حفظ السجلات",
          paragraphs: ["نحفظ جميع سجلات KYC والمعاملات لمدة لا تقل عن ١٠ سنوات."],
        },
        {
          heading: "مسؤول الالتزام",
          paragraphs: ["compliance@aqarmudar.sa"],
        },
        {
          heading: "التعاون مع الجهات النظامية",
          paragraphs: [
            "نتعاون بشكل كامل مع الجهات النظامية المختصة، ونستجيب لطلبات المعلومات القانونية خلال المدد المحددة نظامًا.",
          ],
        },
      ],
      closing: jurisdictionClosingAr,
    },

    refund: {
      slug: "refund",
      title: "سياسة الرسوم والاسترداد",
      eyebrow: "المدفوعات والاسترداد",
      intro: "توضح هذه السياسة الرسوم المفروضة على خدمات المنصة، وشروط استرداد المدفوعات.",
      sections: [
        {
          heading: "رسوم الاعتماد الهندسي",
          paragraphs: [
            "يُسترد ١٠٠٪ من قيمة الاعتماد الهندسي إذا أُلغي قبل موعد الزيارة الميدانية. بعد الزيارة لا يُسترد المبلغ لأن الخدمة قُدِّمت.",
          ],
        },
        {
          heading: "الاشتراكات",
          paragraphs: [
            "رسوم الاشتراك الشهري لا تُسترد بشكل جزئي، ويمكن إلغاء التجديد التلقائي في أي وقت من إعدادات الحساب.",
          ],
        },
        {
          heading: "استثمار البيع الجزئي",
          bullets: [
            "يمكن الاسترداد خلال المدة النظامية (١٤ يومًا وفق نظام حماية المستهلك) طالما لم تُوزَّع الحصص أو تُسجَّل رسميًا كملكية.",
            "بعد تسجيل الحصة رسميًا، يخضع الاسترداد لآلية إعادة بيع الحصة داخل المنصة، وليس للاسترداد المباشر.",
            "الاسترداد يتم لنفس وسيلة الدفع خلال ٧ أيام عمل.",
          ],
        },
        {
          heading: "رسوم بوابة الدفع",
          paragraphs: [
            "قد لا يشمل الاسترداد رسوم معالجة بوابة الدفع، وسيتم إبلاغك بذلك قبل التأكيد.",
          ],
        },
        {
          heading: "آلية طلب الاسترداد",
          paragraphs: [
            "يمكن طلب الاسترداد من صفحة الاستثمار في لوحة التحكم، أو مراسلة refunds@aqarmudar.sa مع رقم العملية وسبب الاسترداد.",
          ],
        },
      ],
      closing: jurisdictionClosingAr,
    },
  },

  en: {
    terms: {
      slug: "terms",
      title: "Terms & Conditions",
      eyebrow: "Legal documents",
      intro:
        "These Terms & Conditions govern your use of the Aqar Mudar platform (operated by Bassir Technology Information Company). By using the platform, you agree to be fully bound by them.",
      sections: [
        {
          heading: "Nature of the service",
          paragraphs: [
            "The platform provides property-listing services and connects owners with investors and buyers, in addition to providing certified engineering reports (Alarrab Certified) and real-estate development studies.",
            "The platform is not a party to any sale or purchase contract concluded between users, and is not responsible for the accuracy of data provided by owners outside the scope of the certified engineering report.",
          ],
        },
        {
          heading: "Eligibility",
          bullets: [
            "The user must be at least 18 years of age.",
            "Accurate and verifiable information must be provided at registration.",
            "Investing requires identity verification via Nafath.",
          ],
        },
        {
          heading: "Account & security",
          paragraphs: [
            "The user is responsible for protecting their login credentials and enabling two-factor authentication for accounts that conduct financial transactions. Any activity through the account is deemed to originate from its owner.",
          ],
        },
        {
          heading: "Property listings",
          paragraphs: [
            "Every property published on the platform undergoes an engineering review by Alarrab Engineering & Partner before publication. The owner is responsible for the accuracy of the description and commercial information (price, type, location).",
            "The platform reserves the right to reject or remove any property that does not meet certification standards.",
          ],
        },
        {
          heading: "Real-estate investment",
          bullets: [
            "The partial-sale product is subject to the relevant Saudi regulatory frameworks and may require structuring through approved vehicles (an SPV or a real-estate fund).",
            "The investor acknowledges having reviewed the full engineering report and the stated risk level.",
            "The figures and returns provided are estimates and are not a guarantee of any future return.",
          ],
        },
        {
          heading: "Fees & billing",
          paragraphs: [
            "The platform may charge commissions or fees on transactions, which are clearly disclosed before the transaction is completed. Fees are inclusive of VAT under Saudi regulations.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "All platform content (logo, design, code, reports) is intellectual property owned by Bassir Technology Information Company and its partners. Reuse without written permission is prohibited.",
          ],
        },
        {
          heading: "Limitation of liability",
          paragraphs: [
            "The platform does not guarantee the accuracy of market-value estimates or future returns. Real-estate investment carries risk, and the investor bears responsibility for their own investment decisions.",
          ],
        },
        {
          heading: "Account termination",
          paragraphs: [
            "The platform has the right to suspend or terminate any account in the event of a breach of these terms, suspected fraudulent activity, or non-compliance with anti-money-laundering requirements.",
          ],
        },
        {
          heading: "Amendments",
          paragraphs: [
            "The platform has the right to amend these terms, and will notify the user of any material change by email or an in-platform notice; the user may be required to re-consent.",
          ],
        },
        {
          heading: "Legal correspondence",
          paragraphs: ["legal@aqarmudar.sa"],
        },
      ],
      closing: jurisdictionClosingEn,
    },

    privacy: {
      slug: "privacy",
      title: "Privacy Policy — PDPL",
      eyebrow: "Personal data protection",
      intro:
        "The Aqar Mudar platform complies with the Saudi Personal Data Protection Law (PDPL) issued by the Saudi Data & AI Authority (SDAIA). This policy explains the types of data we collect and how we use and protect it.",
      sections: [
        {
          heading: "Data we collect",
          bullets: [
            "Identity data: name, email, phone number, and national ID (when verified via Nafath).",
            "Transaction data: listed properties, investments, and inquiries.",
            "Technical data: IP address, device type, and usage logs.",
            "Payment data: processed through licensed gateways (Moyasar / Stripe); we do not store card numbers.",
          ],
        },
        {
          heading: "Legal basis for processing",
          paragraphs: [
            "We process your data on the basis of: (a) your explicit consent, (b) performance of the service contract, (c) compliance with regulatory requirements, (d) legitimate interest in improving the service and preventing fraud.",
          ],
        },
        {
          heading: "Uses of data",
          bullets: [
            "Account creation and identity verification.",
            "Listing properties and connecting parties.",
            "Processing payments and investments.",
            "Account notifications and invoices.",
            "Improving the platform and preventing fraud.",
          ],
        },
        {
          heading: "Data sharing",
          paragraphs: [
            "We do not sell your data. We may share it only with: the engineering consultant (Alarrab) to issue the report, the development contractor (Azoom) when a development study is requested, payment gateways to complete a transaction, and regulatory authorities upon lawful request (SAMA, CMA, municipalities, ZATCA).",
          ],
        },
        {
          heading: "Your rights",
          bullets: [
            "Access your data.",
            "Correct inaccurate data.",
            "Delete your data (except what the law requires us to retain).",
            "Withdraw your consent at any time.",
            "Restrict or object to processing.",
          ],
        },
        {
          heading: "Retention period",
          paragraphs: [
            "We retain data for as long as the account is active, and for an additional period as required by law (a minimum of 10 years for financial transaction records).",
          ],
        },
        {
          heading: "Transfers outside the Kingdom",
          paragraphs: [
            "We comply with SDAIA's controls on transferring data outside the Kingdom. Any transfer is made with appropriate safeguards (Standard Contractual Clauses).",
          ],
        },
        {
          heading: "Security",
          paragraphs: [
            "TLS 1.2+ encryption for all connections, bcrypt password hashing, complete audit logs, optional two-factor authentication, and multi-role access controls.",
          ],
        },
        {
          heading: "Data Protection Officer (DPO)",
          paragraphs: ["To exercise your rights or report an incident: dpo@aqarmudar.sa"],
        },
      ],
      closing: jurisdictionClosingEn,
    },

    disclaimer: {
      slug: "disclaimer",
      title: "Disclaimer",
      eyebrow: "Liability & risk",
      intro:
        "Real-estate investment carries risk. The investment decision is a personal responsibility, and this document explains the limits of liability of the platform and its affiliated parties.",
      sections: [
        {
          heading: "No guarantee of return",
          paragraphs: [
            "All estimates of expected return, value-uplift opportunities, and estimated lifespan are engineering estimates based on the property's current condition, and are not guarantees of any future return. The market value of properties may rise or fall.",
          ],
        },
        {
          heading: "The engineering report",
          paragraphs: [
            "The report issued by Alarrab Engineering & Partner is based on a field inspection on a specific date, and the property's condition may change afterward. The report does not substitute for a personal inspection or legal advice when selling or buying.",
          ],
        },
        {
          heading: "No financial advice",
          paragraphs: [
            "The platform's content is informational and does not constitute financial, investment, tax, or legal advice. Consulting a licensed professional before any major investment decision is recommended.",
          ],
        },
        {
          heading: "Legal structure of shares",
          paragraphs: [
            "Partial sale is organized under approved Saudi legal frameworks (which may include an SPV, a real-estate fund, or any structure regulated by the legislator). The investor must review the standard share contract before investing.",
          ],
        },
        {
          heading: "Minimum investment",
          paragraphs: [
            "The platform may impose a minimum and maximum investment per property in accordance with anti-money-laundering requirements and the investor's financial standing.",
          ],
        },
        {
          heading: "Marketing content",
          paragraphs: [
            "Any marketing content about a property on the platform does not constitute a formal offer. The formal offer takes place within the platform and through documented contracts.",
          ],
        },
        {
          heading: "Force majeure",
          paragraphs: [
            "The platform is not liable for any breach resulting from circumstances beyond its control (disasters, bans, outages of third-party systems).",
          ],
        },
      ],
      closing: jurisdictionClosingEn,
    },

    risk: {
      slug: "risk",
      title: "Investment Risk Disclosure",
      eyebrow: "Material risks",
      intro:
        "This disclosure explains the material risks of real-estate investment through the Aqar Mudar platform. It must be read before investing in any property.",
      sections: [
        {
          heading: "Market risk",
          paragraphs: [
            "Property values may rise or fall as a result of economic, regulatory, or demographic factors beyond the control of the platform or the owner.",
          ],
        },
        {
          heading: "Liquidity risk",
          paragraphs: [
            "Shares in a partial sale may not be immediately sellable. Selling your share may take time and require a suitable price.",
          ],
        },
        {
          heading: "Tenant risk",
          paragraphs: [
            "Rental return depends on property occupancy and rent collection. A tenant may stop paying or vacate the property.",
          ],
        },
        {
          heading: "Development risk",
          paragraphs: [
            "When executing development or renovation studies, actual cost or duration may exceed the estimates stated in the report.",
          ],
        },
        {
          heading: "Concentration risk",
          paragraphs: ["Lack of portfolio diversification increases risk. Do not invest more than you can afford to lose."],
        },
        {
          heading: "Regulatory risk",
          paragraphs: [
            "Any change in real-estate, investment, or tax regulations in the Kingdom may affect the performance of your investment.",
          ],
        },
        {
          heading: "Third-party risk",
          paragraphs: [
            "The platform relies on third parties (payment gateways, contractors, consultants). Failure of any of them may affect service delivery.",
          ],
        },
        {
          heading: "Warning",
          paragraphs: [
            "You may lose part or all of the invested capital. Real-estate investment is a long-term decision and is not guaranteed.",
          ],
        },
      ],
      closing: jurisdictionClosingEn,
    },

    aml: {
      slug: "aml",
      title: "Anti-Money Laundering & Know Your Customer (AML / KYC)",
      eyebrow: "Compliance",
      intro:
        "The Aqar Mudar platform complies with the Anti-Money Laundering Law issued by Royal Decree No. M/20, counter-terrorist-financing regulations, and the instructions of the Saudi Central Bank (SAMA) and the Capital Market Authority (CMA).",
      sections: [
        {
          heading: "Know Your Customer (KYC)",
          bullets: [
            "Identity verification via Nafath for all investors.",
            "Phone number verification via OTP.",
            "Email verification.",
            "For investments above SAR 200,000: additional documentation (source of funds, proof of income, credit rating).",
          ],
        },
        {
          heading: "Monitoring & reporting",
          bullets: [
            "Automated transaction monitoring to detect suspicious patterns.",
            "Escalation of suspicious transactions to the internal compliance committee.",
            "Immediate reporting to SAFIU whenever there is any suspicion.",
          ],
        },
        {
          heading: "Prohibited persons",
          paragraphs: [
            "We refuse to deal with persons listed on local and international sanctions lists (SAMA, OFAC, UN Sanctions).",
          ],
        },
        {
          heading: "Record keeping",
          paragraphs: ["We retain all KYC and transaction records for no less than 10 years."],
        },
        {
          heading: "Compliance officer",
          paragraphs: ["compliance@aqarmudar.sa"],
        },
        {
          heading: "Cooperation with regulators",
          paragraphs: [
            "We cooperate fully with the competent regulatory authorities and respond to lawful requests for information within the legally prescribed timeframes.",
          ],
        },
      ],
      closing: jurisdictionClosingEn,
    },

    refund: {
      slug: "refund",
      title: "Fees & Refund Policy",
      eyebrow: "Payments & refunds",
      intro: "This policy explains the fees charged for platform services and the terms for refunding payments.",
      sections: [
        {
          heading: "Engineering certification fees",
          paragraphs: [
            "100% of the engineering certification fee is refunded if cancelled before the scheduled site visit. After the visit, the amount is not refundable because the service has been rendered.",
          ],
        },
        {
          heading: "Subscriptions",
          paragraphs: [
            "Monthly subscription fees are not partially refundable, and auto-renewal can be cancelled at any time from account settings.",
          ],
        },
        {
          heading: "Partial-sale investment",
          bullets: [
            "A refund is possible within the statutory period (14 days under consumer-protection regulation) as long as the shares have not been distributed or formally registered as ownership.",
            "After a share is formally registered, a refund is subject to the in-platform share resale mechanism rather than a direct refund.",
            "Refunds are made to the same payment method within 7 business days.",
          ],
        },
        {
          heading: "Payment gateway fees",
          paragraphs: [
            "A refund may not include the payment gateway's processing fees, and you will be informed of this before confirmation.",
          ],
        },
        {
          heading: "How to request a refund",
          paragraphs: [
            "A refund can be requested from the investment page in your dashboard, or by emailing refunds@aqarmudar.sa with the transaction number and the reason for the refund.",
          ],
        },
      ],
      closing: jurisdictionClosingEn,
    },
  },
};

export const LEGAL_ROUTES: Record<Locale, { slug: DocumentSlug; href: string; label: string }[]> = {
  ar: [
    { slug: "terms", href: "/legal/terms", label: "الشروط والأحكام" },
    { slug: "privacy", href: "/legal/privacy", label: "سياسة الخصوصية — PDPL" },
    { slug: "disclaimer", href: "/legal/disclaimer", label: "إخلاء المسؤولية" },
    { slug: "risk", href: "/legal/risk", label: "إفصاح مخاطر الاستثمار" },
    { slug: "aml", href: "/legal/aml", label: "AML / KYC" },
    { slug: "refund", href: "/legal/refund", label: "سياسة الرسوم والاسترداد" },
  ],
  en: [
    { slug: "terms", href: "/legal/terms", label: "Terms & Conditions" },
    { slug: "privacy", href: "/legal/privacy", label: "Privacy Policy — PDPL" },
    { slug: "disclaimer", href: "/legal/disclaimer", label: "Disclaimer" },
    { slug: "risk", href: "/legal/risk", label: "Investment Risk Disclosure" },
    { slug: "aml", href: "/legal/aml", label: "AML / KYC" },
    { slug: "refund", href: "/legal/refund", label: "Fees & Refund Policy" },
  ],
};

export function getDocument(slug: DocumentSlug, locale: Locale = "ar"): LegalDoc {
  return LEGAL_DOCS[locale][slug];
}

export function getDocumentVersion(slug: DocumentSlug): string {
  return DOCUMENT_VERSIONS[slug];
}
