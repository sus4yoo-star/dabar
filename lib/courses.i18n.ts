// 양육 과정 콘텐츠 번역 오버레이 (영어/태국어)
// ───────────────────────────────────────────────────────────
// 한국어 원본은 lib/courses.ts(COURSES)에 그대로 두고, 여기에 언어별 번역만 얹습니다.
// getCourse(slug, lang)가 원본 위에 이 오버레이를 병합합니다.
// 번역이 없는 항목은 자동으로 한국어로 표시됩니다(graceful fallback).
//
// ⚠️ 영어=NIV, 태국어=Thai Standard Version(TSV) 기준 성구. 태국어는 초안이므로
//    출시 전 태국어 사용자 검수를 권장합니다.
//
// 구조: slug → { en|th → { title?, subtitle?, lessons: { [lessonId]: LessonTrans } } }
// LessonTrans 의 teaching / questions / options 는 한국어 원본과 "같은 순서"여야 합니다.

export type TransLang = "en" | "th";

export interface QuestionTrans {
  question?: string;
  options?: string[];   // 원본과 동일한 순서 (정답 인덱스 유지)
  explanation?: string;
}
export interface LessonTrans {
  title?: string;
  verse?: string;
  verseRef?: string;
  label?: string;
  section?: string;
  teaching?: string[];
  questions?: QuestionTrans[];
}
export interface CourseTransLang {
  title?: string;
  subtitle?: string;
  lessons: Record<string, LessonTrans>;
}

export const COURSE_TRANS: Record<string, Partial<Record<TransLang, CourseTransLang>>> = {
  // ───────────────────────── 새신자 (newcomer) ─────────────────────────
  newcomer: {
    en: {
      title: "New Believer",
      subtitle: "For those who just met Jesus",
      lessons: {
        "1": {
          title: "Who Is God?",
          verse: "In the beginning God created the heavens and the earth.",
          verseRef: "Genesis 1:1 (NIV)",
          teaching: [
            "God is the Creator who made the whole world, and He exists eternally of Himself. We are creatures He has made, and in Him we find true life and the meaning of life.",
            "God is love, and He is holy and righteous. He is one God, yet exists in three persons — Father, Son, and Holy Spirit (the Trinity).",
            "This God is not far off; He is a Father who calls us as His children and longs to meet us personally.",
            "The Westminster Shorter Catechism Q.1 teaches: “Man’s chief end is to glorify God and to enjoy Him forever.” We were made to know and glorify this very God.",
          ],
          questions: [
            { question: "Who is God?", options: ["The Creator who made the world", "A god made by people", "Nature itself", "An old story"], explanation: "God is the Creator who made the heavens and the earth (Gen 1:1)." },
            { question: "How does the one God exist?", options: ["As three persons — Father, Son, Spirit", "As three different gods", "All alone", "Unknowable"], explanation: "One God in three persons is called the Trinity." },
            { question: "How does God want to relate to us?", options: ["As a Father who calls us His children", "With indifference", "Only as servants", "From far away"], explanation: "He wants to make us His children and meet us personally." },
            { question: "In how many days did God create the world?", options: ["Six days", "One day", "One month", "One year"], explanation: "God created the heavens and earth in six days." },
            { question: "What is man’s chief end? (Catechism Q.1)", options: ["To glorify God and enjoy Him forever", "To earn lots of money", "To live long", "To become famous"], explanation: "This is the teaching of Shorter Catechism Q.1." },
            { question: "How many Gods are there?", options: ["Only one", "Two", "Three (separate)", "Many"], explanation: "The living and true God is only one." },
            { question: "Which is NOT one of the three persons of God?", options: ["An angel", "The Father", "The Son", "The Holy Spirit"], explanation: "The three persons are the Father, Son, and Holy Spirit." },
            { question: "Which correctly describes God’s character?", options: ["He is love and holy", "He is fickle", "He is weak", "He is indifferent"], explanation: "God is love, holy, and righteous." },
            { question: "What are people in relation to God?", options: ["Creatures He has made", "Another god", "A product of chance", "God’s master"], explanation: "We are creatures God has made." },
            { question: "Where is God?", options: ["Everywhere (omnipresent)", "Only in heaven", "Only in church buildings", "Nowhere"], explanation: "God is infinite and is everywhere." },
          ],
        },
        "2": {
          title: "What Kind of Book Is the Bible?",
          verse: "All Scripture is God-breathed.",
          verseRef: "2 Timothy 3:16 (NIV)",
          teaching: [
            "The Bible is ‘the Word of God,’ which God had people write down. It has 39 books in the Old Testament and 27 in the New — 66 books in all.",
            "The Bible tells us who God is, salvation through Jesus, and how we ought to live.",
            "So Christians steadily read and hear the Bible and live according to its Word.",
          ],
          questions: [
            { question: "What kind of book is the Bible?", options: ["The Word of God", "A biography of great people", "A historical novel", "A poetry collection"], explanation: "The Bible is the Word of God, written by God’s inspiration." },
            { question: "How many books are in the Bible total?", options: ["66 books", "100 books", "27 books", "39 books"], explanation: "OT 39 + NT 27 = 66 books." },
            { question: "What is the core message of the Bible?", options: ["Salvation through Jesus", "How to make money", "Health secrets", "How to tell fortunes"], explanation: "The center of the Bible is salvation through Jesus Christ." },
            { question: "How many books are in the Old Testament?", options: ["39 books", "27 books", "66 books", "12 books"], explanation: "The Old Testament has 39 books." },
            { question: "How many books are in the New Testament?", options: ["27 books", "39 books", "66 books", "4 books"], explanation: "The New Testament has 27 books." },
            { question: "By whose inspiration was the Bible written?", options: ["God (the Holy Spirit)", "Angels", "A king", "Scholars"], explanation: "All Scripture is God-breathed (2 Tim 3:16)." },
            { question: "What is the first book of the Bible?", options: ["Genesis", "Exodus", "Psalms", "Matthew"], explanation: "The first book is Genesis." },
            { question: "What is the last book of the Bible?", options: ["Revelation", "Malachi", "John", "Acts"], explanation: "The last book is Revelation." },
            { question: "Which is NOT one of the Gospels recording Jesus’ life?", options: ["Genesis", "Matthew", "Mark", "Luke"], explanation: "The Gospels are Matthew, Mark, Luke, and John." },
            { question: "What is the right attitude toward the Bible?", options: ["Read it steadily and follow it", "Keep it as decoration", "Ignore it", "Read it only once"], explanation: "We steadily read the Word and live by it." },
          ],
        },
        "3": {
          title: "Human Sin and God’s Love",
          verse: "for all have sinned and fall short of the glory of God,",
          verseRef: "Romans 3:23 (NIV)",
          teaching: [
            "People turn away from God, live by their own will, and sin. Sin blocks the way between God and us, and its result is death.",
            "Yet God loved us sinners and sent His one and only Son, Jesus, opening the way of salvation.",
            "Admitting our sin and returning to God is the very beginning of salvation.",
          ],
          questions: [
            { question: "What do all people have in common, according to the Bible?", options: ["They have sinned", "They are perfect", "They are wealthy", "They are wise"], explanation: "All have sinned (Rom 3:23)." },
            { question: "What is the result of sin?", options: ["Separation from God, leading to death", "Brief discomfort", "Nothing happens", "Receiving blessing"], explanation: "The wages of sin is death (Rom 6:23)." },
            { question: "What is God’s heart toward sinners?", options: ["He opens the way of salvation in love", "He hates and abandons them", "Indifference", "Only punishment"], explanation: "God loved us and sent Jesus." },
            { question: "Through whom did sin first enter the world?", options: ["Adam and Eve", "Noah", "Moses", "David"], explanation: "Sin entered through the disobedience of the first humans, Adam and Eve." },
            { question: "In ‘The wages of sin is ___’ (Rom 6:23), what fills the blank?", options: ["Death", "Wealth", "Honor", "Health"], explanation: "The wages of sin is death (Rom 6:23)." },
            { question: "Sin blocks the way between us and what?", options: ["God", "Money", "Friends", "Family"], explanation: "Sin blocks the way between God and us." },
            { question: "Is everyone a sinner?", options: ["Yes, all have sinned", "Only some", "No", "Unknown"], explanation: "All have sinned (Rom 3:23)." },
            { question: "What is the beginning of salvation?", options: ["Admitting sin and returning to God", "Saving up money", "Piling up good deeds", "Just ignoring it"], explanation: "Repentance — admitting sin and turning back — is the beginning." },
            { question: "Whom did God send to save sinners?", options: ["His one and only Son, Jesus", "An angel", "Only a prophet", "A king"], explanation: "God sent His one and only Son, Jesus (John 3:16)." },
            { question: "God hates sin, but how does He treat the sinner?", options: ["He loves them and opens salvation", "Hates them just the same", "Abandons them", "Pretends not to know"], explanation: "He hates the sin but loves the sinner." },
          ],
        },
        "4": {
          title: "Jesus Christ and Salvation",
          verse: "For God so loved the world that he gave his one and only Son,",
          verseRef: "John 3:16 (NIV)",
          teaching: [
            "Jesus is the Son of God. He came as a man, died on the cross in our place for our sins, and rose again on the third day.",
            "We receive forgiveness of sins and eternal life as a gift — not by good works but by faith in Jesus. This is grace.",
            "Whoever believes in and receives Jesus as Savior and Lord becomes a child of God.",
          ],
          questions: [
            { question: "Why did Jesus die on the cross?", options: ["To bear our sins in our place", "For political reasons", "By mistake", "Unknown"], explanation: "Jesus died bearing our sins in our place." },
            { question: "How are we saved?", options: ["By faith in Jesus (by grace)", "By good deeds", "With money", "By effort"], explanation: "Salvation is God’s gift received by faith (Eph 2:8)." },
            { question: "What does one who believes and receives Jesus become?", options: ["A child of God", "An angel", "A pastor", "Rich"], explanation: "To those who receive Him He gives the right to become children of God (John 1:12)." },
            { question: "Whose Son is Jesus?", options: ["The Son of God", "Son of an angel", "Son of a king", "Merely a son of man"], explanation: "Jesus is the Son of God." },
            { question: "How many days after His death did Jesus rise?", options: ["On the third day", "After one day", "After a month", "He did not rise"], explanation: "He rose on the third day (1 Cor 15:4)." },
            { question: "On what basis are we saved?", options: ["God’s grace (a gift)", "My goodness", "Money", "Effort"], explanation: "Salvation is by grace, through faith (Eph 2:8)." },
            { question: "What is it called that Jesus came as a man?", options: ["The Incarnation", "The Resurrection", "The Ascension", "Creation"], explanation: "God becoming man is called the Incarnation." },
            { question: "What is the event of Jesus rising again called?", options: ["The Resurrection", "The Incarnation", "Baptism", "The Transfiguration"], explanation: "Conquering death and living again is called the Resurrection." },
            { question: "How is salvation received?", options: ["By faith in Jesus", "By qualifying", "By paying money", "By passing a test"], explanation: "We are saved only by faith in Jesus." },
            { question: "What gift is given to those who believe in Jesus?", options: ["Forgiveness of sins and eternal life", "Wealth", "Power", "Popularity"], explanation: "He gives forgiveness of sins and eternal life as a gift." },
          ],
        },
      },
    },
    th: {
      title: "ผู้เชื่อใหม่",
      subtitle: "สำหรับผู้ที่เพิ่งพบพระเยซู",
      lessons: {
        "1": {
          title: "พระเจ้าทรงเป็นผู้ใด",
          verse: "ในปฐมกาล พระเจ้าทรงเนรมิตสร้างฟ้าและแผ่นดิน",
          verseRef: "ปฐมกาล 1:1 (TSV)",
          teaching: [
            "พระเจ้าทรงเป็นพระผู้สร้างที่ทรงสร้างโลกทั้งใบ และทรงดำรงอยู่ชั่วนิรันดร์ด้วยพระองค์เอง เราเป็นสิ่งทรงสร้างของพระองค์ และในพระองค์เราพบชีวิตแท้และความหมายของชีวิต",
            "พระเจ้าทรงเป็นความรัก ทรงบริสุทธิ์และชอบธรรม พระองค์ทรงเป็นพระเจ้าองค์เดียว แต่ทรงดำรงอยู่เป็นสามพระภาค คือ พระบิดา พระบุตร และพระวิญญาณบริสุทธิ์ (ตรีเอกานุภาพ)",
            "พระเจ้าองค์นี้มิได้ทรงอยู่ห่างไกล แต่ทรงเป็นพระบิดาผู้ทรงเรียกเราให้เป็นบุตร และทรงปรารถนาจะพบเราเป็นการส่วนตัว",
            "คำสอนสั้นเวสต์มินสเตอร์ ข้อ 1 สอนว่า “จุดมุ่งหมายสูงสุดของมนุษย์คือการถวายพระเกียรติแด่พระเจ้า และชื่นชมยินดีในพระองค์เป็นนิตย์” เราถูกสร้างขึ้นเพื่อรู้จักและถวายพระเกียรติแด่พระเจ้าองค์นี้",
          ],
          questions: [
            { question: "พระเจ้าทรงเป็นผู้ใด?", options: ["พระผู้สร้างที่ทรงสร้างโลก", "พระเจ้าที่มนุษย์สร้างขึ้น", "ธรรมชาติเอง", "นิทานโบราณ"], explanation: "พระเจ้าทรงเป็นพระผู้สร้างฟ้าและแผ่นดิน (ปฐก. 1:1)" },
            { question: "พระเจ้าองค์เดียวทรงดำรงอยู่อย่างไร?", options: ["เป็นสามพระภาค พระบิดา พระบุตร พระวิญญาณ", "เป็นพระเจ้าสามองค์ที่ต่างกัน", "อยู่ลำพังองค์เดียว", "ไม่อาจรู้ได้"], explanation: "พระเจ้าองค์เดียวในสามพระภาคเรียกว่าตรีเอกานุภาพ" },
            { question: "พระเจ้าทรงปรารถนาจะปฏิบัติต่อเราอย่างไร?", options: ["เป็นพระบิดาผู้ทรงเรียกเราเป็นบุตร", "อย่างไม่แยแส", "เป็นเพียงทาส", "จากที่ไกล"], explanation: "พระองค์ทรงปรารถนาจะรับเราเป็นบุตรและพบเราเป็นการส่วนตัว" },
            { question: "พระเจ้าทรงสร้างโลกในกี่วัน?", options: ["หกวัน", "หนึ่งวัน", "หนึ่งเดือน", "หนึ่งปี"], explanation: "พระเจ้าทรงสร้างฟ้าและแผ่นดินในหกวัน" },
            { question: "จุดมุ่งหมายสูงสุดของมนุษย์คืออะไร? (คำสอนข้อ 1)", options: ["ถวายพระเกียรติแด่พระเจ้าและชื่นชมยินดีในพระองค์เป็นนิตย์", "หาเงินให้ได้มากๆ", "มีอายุยืน", "มีชื่อเสียง"], explanation: "นี่คือคำสอนของคำสอนสั้นข้อ 1" },
            { question: "มีพระเจ้ากี่องค์?", options: ["เพียงองค์เดียว", "สององค์", "สามองค์ (แยกกัน)", "หลายองค์"], explanation: "พระเจ้าผู้ทรงพระชนม์และเที่ยงแท้มีเพียงองค์เดียว" },
            { question: "สิ่งใดไม่ใช่หนึ่งในสามพระภาคของพระเจ้า?", options: ["ทูตสวรรค์", "พระบิดา", "พระบุตร", "พระวิญญาณบริสุทธิ์"], explanation: "สามพระภาคคือพระบิดา พระบุตร และพระวิญญาณบริสุทธิ์" },
            { question: "ข้อใดอธิบายพระลักษณะของพระเจ้าได้ถูกต้อง?", options: ["ทรงเป็นความรักและบริสุทธิ์", "ทรงเอาแน่ไม่ได้", "ทรงอ่อนแอ", "ทรงไม่แยแส"], explanation: "พระเจ้าทรงเป็นความรัก บริสุทธิ์ และชอบธรรม" },
            { question: "มนุษย์เป็นอะไรต่อพระเจ้า?", options: ["สิ่งทรงสร้างของพระองค์", "พระอีกองค์หนึ่ง", "สิ่งที่เกิดขึ้นโดยบังเอิญ", "นายของพระเจ้า"], explanation: "เราเป็นสิ่งทรงสร้างของพระเจ้า" },
            { question: "พระเจ้าทรงสถิตอยู่ที่ใด?", options: ["ทุกหนทุกแห่ง (ทรงสถิตทุกที่)", "เฉพาะในสวรรค์", "เฉพาะในอาคารโบสถ์", "ไม่ทรงอยู่ที่ใด"], explanation: "พระเจ้าทรงไม่มีขอบเขต จึงทรงสถิตอยู่ทุกที่" },
          ],
        },
        "2": {
          title: "พระคัมภีร์เป็นหนังสือแบบใด",
          verse: "พระคัมภีร์ทุกตอนได้รับการดลใจจากพระเจ้า",
          verseRef: "2 ทิโมธี 3:16 (TSV)",
          teaching: [
            "พระคัมภีร์คือ ‘พระวจนะของพระเจ้า’ ที่พระเจ้าทรงให้มนุษย์บันทึกไว้ มีพันธสัญญาเดิม 39 เล่ม พันธสัญญาใหม่ 27 เล่ม รวมทั้งสิ้น 66 เล่ม",
            "พระคัมภีร์บอกเราว่าพระเจ้าทรงเป็นผู้ใด ความรอดผ่านพระเยซู และเราควรดำเนินชีวิตอย่างไร",
            "ดังนั้นคริสเตียนจึงอ่านและฟังพระคัมภีร์อย่างสม่ำเสมอ และดำเนินชีวิตตามพระวจนะนั้น",
          ],
          questions: [
            { question: "พระคัมภีร์เป็นหนังสือแบบใด?", options: ["พระวจนะของพระเจ้า", "ชีวประวัติคนสำคัญ", "นวนิยายอิงประวัติศาสตร์", "รวมบทกวี"], explanation: "พระคัมภีร์เป็นพระวจนะของพระเจ้า บันทึกขึ้นโดยการดลใจของพระเจ้า" },
            { question: "พระคัมภีร์มีทั้งหมดกี่เล่ม?", options: ["66 เล่ม", "100 เล่ม", "27 เล่ม", "39 เล่ม"], explanation: "พันธสัญญาเดิม 39 + พันธสัญญาใหม่ 27 = 66 เล่ม" },
            { question: "ใจความหลักของพระคัมภีร์คืออะไร?", options: ["ความรอดผ่านพระเยซู", "วิธีหาเงิน", "เคล็ดลับสุขภาพ", "วิธีทำนายโชคชะตา"], explanation: "ศูนย์กลางของพระคัมภีร์คือความรอดผ่านพระเยซูคริสต์" },
            { question: "พันธสัญญาเดิมมีกี่เล่ม?", options: ["39 เล่ม", "27 เล่ม", "66 เล่ม", "12 เล่ม"], explanation: "พันธสัญญาเดิมมี 39 เล่ม" },
            { question: "พันธสัญญาใหม่มีกี่เล่ม?", options: ["27 เล่ม", "39 เล่ม", "66 เล่ม", "4 เล่ม"], explanation: "พันธสัญญาใหม่มี 27 เล่ม" },
            { question: "พระคัมภีร์บันทึกขึ้นโดยการดลใจของผู้ใด?", options: ["พระเจ้า (พระวิญญาณบริสุทธิ์)", "ทูตสวรรค์", "กษัตริย์", "นักปราชญ์"], explanation: "พระคัมภีร์ทุกตอนได้รับการดลใจจากพระเจ้า (2ทธ. 3:16)" },
            { question: "หนังสือเล่มแรกของพระคัมภีร์คืออะไร?", options: ["ปฐมกาล", "อพยพ", "สดุดี", "มัทธิว"], explanation: "หนังสือเล่มแรกคือปฐมกาล" },
            { question: "หนังสือเล่มสุดท้ายของพระคัมภีร์คืออะไร?", options: ["วิวรณ์", "มาลาคี", "ยอห์น", "กิจการ"], explanation: "หนังสือเล่มสุดท้ายคือวิวรณ์" },
            { question: "ข้อใดไม่ใช่ ‘พระกิตติคุณ’ ที่บันทึกพระชนม์ชีพของพระเยซู?", options: ["ปฐมกาล", "มัทธิว", "มาระโก", "ลูกา"], explanation: "พระกิตติคุณคือ มัทธิว มาระโก ลูกา และยอห์น" },
            { question: "ท่าทีที่ถูกต้องต่อพระคัมภีร์คืออะไร?", options: ["อ่านอย่างสม่ำเสมอและทำตาม", "เก็บไว้เป็นของประดับ", "เพิกเฉย", "อ่านเพียงครั้งเดียว"], explanation: "เราอ่านพระวจนะอย่างสม่ำเสมอและดำเนินชีวิตตาม" },
          ],
        },
        "3": {
          title: "ความบาปของมนุษย์และความรักของพระเจ้า",
          verse: "เพราะว่าทุกคนทำบาป และเสื่อมจากพระสิริของพระเจ้า",
          verseRef: "โรม 3:23 (TSV)",
          teaching: [
            "มนุษย์หันหนีจากพระเจ้า ดำเนินชีวิตตามใจตนเองและทำบาป ความบาปขวางกั้นระหว่างพระเจ้ากับเรา และผลของมันคือความตาย",
            "แต่พระเจ้าทรงรักเราที่เป็นคนบาป จึงทรงส่งพระเยซูพระบุตรองค์เดียวของพระองค์มาเปิดทางแห่งความรอด",
            "การยอมรับความบาปและหันกลับมาหาพระเจ้าคือจุดเริ่มต้นของความรอด",
          ],
          questions: [
            { question: "ตามพระคัมภีร์ ทุกคนมีอะไรเหมือนกัน?", options: ["ทำบาป", "สมบูรณ์แบบ", "ร่ำรวย", "ฉลาด"], explanation: "ทุกคนทำบาป (รม. 3:23)" },
            { question: "ผลของความบาปคืออะไร?", options: ["ห่างจากพระเจ้าและนำไปสู่ความตาย", "อึดอัดชั่วคราว", "ไม่มีอะไรเกิดขึ้น", "ได้รับพร"], explanation: "ค่าจ้างของความบาปคือความตาย (รม. 6:23)" },
            { question: "พระทัยของพระเจ้าต่อคนบาปเป็นอย่างไร?", options: ["ทรงเปิดทางแห่งความรอดด้วยความรัก", "ทรงเกลียดและทอดทิ้ง", "ไม่แยแส", "ลงโทษเท่านั้น"], explanation: "พระเจ้าทรงรักเราและทรงส่งพระเยซูมา" },
            { question: "ความบาปเข้ามาในโลกครั้งแรกผ่านผู้ใด?", options: ["อาดัมและเอวา", "โนอาห์", "โมเสส", "ดาวิด"], explanation: "ความบาปเข้ามาผ่านการไม่เชื่อฟังของอาดัมและเอวามนุษย์คู่แรก" },
            { question: "ในข้อ ‘ค่าจ้างของความบาปคือ ___’ (รม. 6:23) ช่องว่างคืออะไร?", options: ["ความตาย", "ทรัพย์สมบัติ", "เกียรติยศ", "สุขภาพ"], explanation: "ค่าจ้างของความบาปคือความตาย (รม. 6:23)" },
            { question: "ความบาปขวางกั้นระหว่างเรากับสิ่งใด?", options: ["พระเจ้า", "เงิน", "เพื่อน", "ครอบครัว"], explanation: "ความบาปขวางกั้นระหว่างพระเจ้ากับเรา" },
            { question: "ทุกคนเป็นคนบาปหรือไม่?", options: ["ใช่ ทุกคนทำบาป", "เพียงบางคน", "ไม่", "ไม่ทราบ"], explanation: "ทุกคนทำบาป (รม. 3:23)" },
            { question: "จุดเริ่มต้นของความรอดคืออะไร?", options: ["ยอมรับบาปและหันกลับมาหาพระเจ้า", "สะสมเงิน", "สะสมความดี", "เพิกเฉย"], explanation: "การกลับใจ คือการยอมรับบาปและหันกลับ คือจุดเริ่มต้น" },
            { question: "พระเจ้าทรงส่งผู้ใดมาช่วยคนบาปให้รอด?", options: ["พระเยซูพระบุตรองค์เดียว", "ทูตสวรรค์", "เพียงผู้เผยพระวจนะ", "กษัตริย์"], explanation: "พระเจ้าทรงส่งพระเยซูพระบุตรองค์เดียวมา (ยน. 3:16)" },
            { question: "พระเจ้าทรงเกลียดบาป แต่ทรงปฏิบัติต่อคนบาปอย่างไร?", options: ["ทรงรักและเปิดทางแห่งความรอด", "ทรงเกลียดเช่นเดียวกัน", "ทรงทอดทิ้ง", "ทรงทำเป็นไม่รู้"], explanation: "ทรงเกลียดบาปแต่ทรงรักคนบาป" },
          ],
        },
        "4": {
          title: "พระเยซูคริสต์และความรอด",
          verse: "เพราะว่าพระเจ้าทรงรักโลกดังนี้ คือได้ประทานพระบุตรองค์เดียวของพระองค์",
          verseRef: "ยอห์น 3:16 (TSV)",
          teaching: [
            "พระเยซูทรงเป็นพระบุตรของพระเจ้า ทรงมาเป็นมนุษย์ สิ้นพระชนม์บนกางเขนแทนความบาปของเรา และทรงเป็นขึ้นมาอีกในวันที่สาม",
            "เราได้รับการอภัยบาปและชีวิตนิรันดร์เป็นของประทาน ไม่ใช่ด้วยการประพฤติดี แต่ด้วยความเชื่อในพระเยซู นี่คือพระคุณ",
            "ผู้ที่เชื่อและต้อนรับพระเยซูเป็นพระผู้ช่วยให้รอดและองค์พระผู้เป็นเจ้าของตน จะได้เป็นบุตรของพระเจ้า",
          ],
          questions: [
            { question: "เหตุใดพระเยซูจึงสิ้นพระชนม์บนกางเขน?", options: ["เพื่อทรงแบกรับบาปของเราแทนเรา", "ด้วยเหตุผลทางการเมือง", "โดยความผิดพลาด", "ไม่ทราบ"], explanation: "พระเยซูสิ้นพระชนม์โดยทรงแบกรับบาปของเราแทน" },
            { question: "เราได้รับความรอดอย่างไร?", options: ["ด้วยความเชื่อในพระเยซู (โดยพระคุณ)", "ด้วยการทำดี", "ด้วยเงิน", "ด้วยความพยายาม"], explanation: "ความรอดเป็นของประทานจากพระเจ้าที่รับโดยความเชื่อ (อฟ. 2:8)" },
            { question: "ผู้ที่เชื่อและต้อนรับพระเยซูจะเป็นอย่างไร?", options: ["ได้เป็นบุตรของพระเจ้า", "กลายเป็นทูตสวรรค์", "กลายเป็นศิษยาภิบาล", "กลายเป็นคนรวย"], explanation: "แก่ผู้ที่ต้อนรับพระองค์ ทรงประทานสิทธิให้เป็นบุตรของพระเจ้า (ยน. 1:12)" },
            { question: "พระเยซูทรงเป็นบุตรของผู้ใด?", options: ["พระบุตรของพระเจ้า", "บุตรของทูตสวรรค์", "บุตรของกษัตริย์", "เป็นเพียงบุตรมนุษย์"], explanation: "พระเยซูทรงเป็นพระบุตรของพระเจ้า" },
            { question: "พระเยซูทรงเป็นขึ้นมาหลังสิ้นพระชนม์กี่วัน?", options: ["ในวันที่สาม", "หลังหนึ่งวัน", "หลังหนึ่งเดือน", "ไม่ได้ทรงเป็นขึ้น"], explanation: "ทรงเป็นขึ้นมาในวันที่สาม (1คร. 15:4)" },
            { question: "เราได้รับความรอดเพราะสิ่งใด?", options: ["พระคุณของพระเจ้า (ของประทาน)", "ความดีของฉัน", "เงิน", "ความพยายาม"], explanation: "ความรอดเป็นโดยพระคุณ ผ่านทางความเชื่อ (อฟ. 2:8)" },
            { question: "การที่พระเยซูเสด็จมาเป็นมนุษย์เรียกว่าอะไร?", options: ["การรับสภาพมนุษย์", "การคืนพระชนม์", "การเสด็จขึ้นสู่สวรรค์", "การทรงสร้าง"], explanation: "การที่พระเจ้าทรงรับสภาพเป็นมนุษย์เรียกว่าการรับสภาพมนุษย์ (อินคาร์เนชัน)" },
            { question: "เหตุการณ์ที่พระเยซูทรงเป็นขึ้นมาเรียกว่าอะไร?", options: ["การคืนพระชนม์", "การรับสภาพมนุษย์", "บัพติศมา", "การจำแลงพระกาย"], explanation: "การชนะความตายและเป็นขึ้นมาเรียกว่าการคืนพระชนม์" },
            { question: "ความรอดรับได้อย่างไร?", options: ["ด้วยความเชื่อในพระเยซู", "ด้วยการมีคุณสมบัติ", "ด้วยการจ่ายเงิน", "ด้วยการสอบผ่าน"], explanation: "เราได้รับความรอดโดยความเชื่อในพระเยซูเท่านั้น" },
            { question: "ของประทานที่ประทานแก่ผู้เชื่อในพระเยซูคืออะไร?", options: ["การอภัยบาปและชีวิตนิรันดร์", "ทรัพย์สมบัติ", "อำนาจ", "ความนิยม"], explanation: "ทรงประทานการอภัยบาปและชีวิตนิรันดร์เป็นของประทาน" },
          ],
        },
      },
    },
  },

  // ───────────────────────── 세례자 (baptism) ─────────────────────────
  baptism: {
    en: {
      title: "Baptism",
      subtitle: "For those preparing for baptism",
      lessons: {
        "1": {
          title: "What Is Baptism?",
          verse: "Therefore go and make disciples of all nations, baptizing them …",
          verseRef: "Matthew 28:19 (NIV)",
          teaching: [
            "Baptism is a sacred rite that publicly confesses and confirms that one has believed in Jesus and become His own.",
            "The water symbolizes the washing away of sin and new life. Baptism signifies that, united with Christ, our old self dies and we live again as a new person.",
            "Baptism does not ‘create’ salvation. It is a means of grace that confirms — as a sign and a seal — the salvation already received by faith.",
            "Our denomination (the Presbyterian Church, Hapdong) baptizes not only those who confess faith themselves but also believers’ children (infant baptism), because the children too are ‘covenant children’ within God’s covenant.",
          ],
          questions: [
            { question: "What is the meaning of baptism?", options: ["A public confession that one belongs to Christ", "A simple bath", "A membership fee", "A graduation ceremony"], explanation: "Baptism is a rite that publicly confesses belonging to Christ." },
            { question: "What does the water of baptism symbolize?", options: ["The washing of sin and new life", "Good luck", "Health", "Wealth"], explanation: "The water symbolizes the washing of sin and new life." },
            { question: "Does baptism create salvation?", options: ["No, it confirms salvation received by faith", "Yes, the water saves", "Unknown", "Partly"], explanation: "Baptism is a sign and seal confirming the salvation received by faith." },
            { question: "In whose name is baptism received?", options: ["The Father, the Son, and the Holy Spirit", "The pastor", "The church", "An angel"], explanation: "It is received in the name of the Father, Son, and Holy Spirit (Matt 28:19)." },
            { question: "Union with whom does baptism signify?", options: ["Christ", "An angel", "The world", "The law"], explanation: "It signifies dying and rising again in union with Christ." },
            { question: "What is the baptism given to believers’ children called?", options: ["Infant baptism", "Re-baptism", "Laying on of hands", "Communion"], explanation: "It is infant baptism given to covenant children (Hapdong)." },
            { question: "What does the Hapdong church call believers’ children?", options: ["Covenant children", "Guests", "Visitors", "Outsiders"], explanation: "Believers’ children are covenant children within God’s covenant." },
            { question: "With what is baptism received?", options: ["Water", "Oil", "Fire", "Incense"], explanation: "It is received through washing with water." },
            { question: "What does the water of baptism NOT symbolize?", options: ["Wealth", "Washing of sin", "New life", "Purity"], explanation: "The water symbolizes washing of sin, new life, and purity (not wealth)." },
            { question: "For adults, what must precede baptism?", options: ["A confession of faith in Christ", "A large offering", "A service record", "Passing a test"], explanation: "Baptism follows a confession of faith and obedience." },
          ],
        },
        "2": {
          title: "Repentance and Faith",
          verse: "Repent, for the kingdom of heaven has come near.",
          verseRef: "Matthew 4:17 (NIV)",
          teaching: [
            "Repentance is turning from sin and changing the direction of heart and life toward God.",
            "Faith is trusting that Jesus is my Savior and entrusting myself entirely to Him.",
            "Repentance and faith are both a one-time decision and a lifelong attitude of life.",
          ],
          questions: [
            { question: "What is repentance?", options: ["Turning from sin back to God", "Merely feeling regret", "Being punished", "Forgetting"], explanation: "Repentance is not mere regret but a change of direction." },
            { question: "What is faith?", options: ["Trusting Jesus and entrusting oneself", "Mere head knowledge", "A feeling", "Luck"], explanation: "Faith is trusting and entrusting oneself." },
            { question: "How long do repentance and faith last?", options: ["A lifelong attitude of life", "Once and done", "Only at baptism", "Not needed"], explanation: "Repentance and faith are a lifelong walk." },
            { question: "In ‘Repent, for the ___ has come near’ (Matt 4:17), the blank is?", options: ["Kingdom of heaven", "Testing", "The end", "Blessing"], explanation: "He said to repent, for the kingdom of heaven has come near." },
            { question: "What accompanies true repentance?", options: ["A change of life (turning around)", "Only regret", "No change", "Boasting"], explanation: "Repentance changes direction and leads to a changed life." },
            { question: "Who is the object of faith?", options: ["Jesus Christ", "Oneself", "The world", "Luck"], explanation: "Faith trusts and relies on Jesus Christ." },
            { question: "By what are we justified?", options: ["By faith", "By works", "By money", "By bloodline"], explanation: "We are justified by faith alone (justification by faith)." },
            { question: "Repentance turns from what to what?", options: ["From sin to God", "From God to sin", "From the church to the world", "From light to darkness"], explanation: "It is turning from sin toward God." },
            { question: "Is faith merely knowing?", options: ["No, it is trusting and entrusting", "Yes, knowledge is enough", "Just a feeling", "Unknown"], explanation: "True faith trusts and entrusts oneself." },
            { question: "What is the right attitude when we fall into sin again?", options: ["Repent and come to the Lord again", "Give up", "Hide it", "Only blame oneself"], explanation: "We repent and come again to the Lord." },
          ],
        },
        "3": {
          title: "Assurance of Salvation",
          verse: "… so that you may know that you have eternal life.",
          verseRef: "1 John 5:13 (NIV)",
          teaching: [
            "Assurance of salvation rests not on my feelings but on God’s promise (His Word).",
            "God has clearly promised eternal life to those who believe in Jesus.",
            "Therefore, even when our hearts waver, we hold to the promise of the Word and enjoy peace.",
          ],
          questions: [
            { question: "What is the basis of assurance of salvation?", options: ["God’s promise (His Word)", "My mood", "What others say", "Luck"], explanation: "Assurance rests not on changing feelings but on the unchanging Word." },
            { question: "What has God given to those who believe in Jesus?", options: ["Eternal life", "Wealth", "Health", "Success"], explanation: "He has given eternal life to believers (1 John 5:13)." },
            { question: "When feelings waver, what do we do?", options: ["Hold to the promise of the Word", "Doubt our salvation", "Give up", "Don’t know"], explanation: "When we hold to the promise, we enjoy peace." },
            { question: "On what is assurance of salvation based?", options: ["God’s promise (His Word)", "My feelings", "Other people", "Circumstances"], explanation: "Assurance rests on the unchanging Word." },
            { question: "What has God promised believers?", options: ["Eternal life", "Wealth", "Health", "Success"], explanation: "He has given eternal life to believers (1 John 5:13)." },
            { question: "Is salvation maintained by my works?", options: ["No, God holds us fast", "Yes, by my works", "Unknown", "Partly"], explanation: "God holds and preserves us to the end." },
            { question: "Which is a wrong basis that shakes assurance?", options: ["The mood of the day", "God’s Word", "The cross of Christ", "God’s faithfulness"], explanation: "Changing feelings are not a basis for assurance." },
            { question: "Who gives the status of ‘child of God’?", options: ["God", "Myself", "The church", "The world"], explanation: "God has made us His children." },
            { question: "What is the life of one who has assurance of salvation?", options: ["Living in peace and thankfulness", "Always anxious", "Proud", "Indifferent"], explanation: "Assurance leads to a life of peace and gratitude." },
            { question: "What happens to the saved person in the end?", options: ["God protects and preserves them", "Often loses it", "Keeps it only by oneself", "Unknown"], explanation: "The saints are preserved to the end (kept by God)." },
          ],
        },
        "4": {
          title: "The Christian Life and Communion",
          verse: "… do this in remembrance of me.",
          verseRef: "Luke 22:19 (NIV)",
          teaching: [
            "The saved person obeys God with thankfulness and grows ever more like Jesus (sanctification).",
            "Faith grows through worship, prayer, the Word, fellowship, and service. Faith grows not alone but within the community of the church.",
            "Communion (the Lord’s Supper) is a rite in which, with bread and cup, we remember Jesus’ cross and engrave its grace on our hearts.",
          ],
          questions: [
            { question: "What is the life of a saved person?", options: ["Obeying in thankfulness and growing like Jesus", "Living as one pleases", "No change", "Outward show"], explanation: "As fruit of salvation, we live a sanctified life." },
            { question: "Which is NOT a channel for faith to grow?", options: ["Isolating oneself", "Worship", "Prayer", "The Word"], explanation: "Faith grows together within community." },
            { question: "What is the meaning of Communion (the Lord’s Supper)?", options: ["Remembering Jesus’ cross", "A simple meal", "Socializing", "Luck"], explanation: "Communion is a rite remembering the Lord’s death." },
            { question: "What is it called when a saved person grows more like Jesus?", options: ["Sanctification", "Justification", "Creation", "Resurrection"], explanation: "Growing in holiness to become like Jesus is called sanctification." },
            { question: "Which is NOT a channel for faith to grow?", options: ["Isolation", "Worship", "Prayer", "The Word"], explanation: "Faith grows through worship, prayer, the Word, and fellowship." },
            { question: "What is used in Communion?", options: ["Bread and cup", "Water", "Oil", "Incense"], explanation: "With bread and cup we remember the Lord’s body and blood." },
            { question: "What does Communion remember?", options: ["Jesus’ cross (His death)", "An Easter event", "A birthday", "Harvest"], explanation: "It remembers the Lord’s death (Luke 22:19)." },
            { question: "What is needed to partake of Communion worthily?", options: ["Self-examination (repentance and faith)", "A large offering", "A church office", "No special qualification"], explanation: "We examine ourselves and partake with discernment (1 Cor 11:28)." },
            { question: "How should a Christian worship?", options: ["Wholeheartedly, with thankfulness", "Reluctantly", "In form only", "Not at all"], explanation: "We worship wholeheartedly, thankful for the grace of salvation." },
            { question: "Where does faith grow together?", options: ["Within the church community", "Only alone", "Only on the internet", "It doesn’t grow"], explanation: "Faith grows together within the church community." },
          ],
        },
      },
    },
    th: {
      title: "บัพติศมา",
      subtitle: "สำหรับผู้ที่เตรียมรับบัพติศมา",
      lessons: {
        "1": {
          title: "บัพติศมาคืออะไร",
          verse: "เพราะฉะนั้น ท่านทั้งหลายจงออกไปและนำชนทุกชาติมาเป็นสาวกของเรา จงบัพติศมาพวกเขา …",
          verseRef: "มัทธิว 28:19 (TSV)",
          teaching: [
            "บัพติศมาเป็นพิธีศักดิ์สิทธิ์ที่ประกาศและยืนยันต่อสาธารณะว่า ผู้นั้นได้เชื่อในพระเยซูและเป็นคนของพระองค์แล้ว",
            "น้ำเป็นสัญลักษณ์ของการชำระบาปและชีวิตใหม่ บัพติศมาแสดงว่าเราเป็นหนึ่งเดียวกับพระคริสต์ คนเก่าตายไปและเรามีชีวิตใหม่เป็นคนใหม่",
            "บัพติศมาไม่ได้ ‘ทำให้เกิด’ ความรอด แต่เป็นช่องทางแห่งพระคุณที่ยืนยันความรอดซึ่งได้รับโดยความเชื่ออยู่แล้ว ในฐานะเครื่องหมายและตราประทับ",
            "คณะนิกายของเรา (เพรสไบทีเรียนฮัปดง) ให้บัพติศมาไม่เพียงแก่ผู้ที่สารภาพความเชื่อด้วยตนเอง แต่ยังให้แก่บุตรของผู้เชื่อด้วย (บัพติศมาทารก) เพราะบุตรเหล่านั้นก็เป็น ‘บุตรแห่งพันธสัญญา’ ที่อยู่ในพันธสัญญาของพระเจ้า",
          ],
          questions: [
            { question: "ความหมายของบัพติศมาคืออะไร?", options: ["การประกาศต่อสาธารณะว่าเป็นคนของพระคริสต์", "การอาบน้ำธรรมดา", "ค่าสมัครสมาชิก", "พิธีจบการศึกษา"], explanation: "บัพติศมาเป็นพิธีที่ประกาศต่อสาธารณะว่าเป็นคนของพระคริสต์" },
            { question: "น้ำในบัพติศมาเป็นสัญลักษณ์ของอะไร?", options: ["การชำระบาปและชีวิตใหม่", "โชคลาภ", "สุขภาพ", "ทรัพย์สมบัติ"], explanation: "น้ำเป็นสัญลักษณ์ของการชำระบาปและชีวิตใหม่" },
            { question: "บัพติศมาทำให้เกิดความรอดหรือไม่?", options: ["ไม่ มันยืนยันความรอดที่ได้รับโดยความเชื่อ", "ใช่ น้ำช่วยให้รอด", "ไม่ทราบ", "ครึ่งๆ"], explanation: "บัพติศมาเป็นเครื่องหมายและตราประทับที่ยืนยันความรอดที่ได้รับโดยความเชื่อ" },
            { question: "บัพติศมารับในพระนามของผู้ใด?", options: ["พระบิดา พระบุตร และพระวิญญาณบริสุทธิ์", "ศิษยาภิบาล", "คริสตจักร", "ทูตสวรรค์"], explanation: "รับในพระนามของพระบิดา พระบุตร และพระวิญญาณบริสุทธิ์ (มธ. 28:19)" },
            { question: "บัพติศมาแสดงถึงการเป็นหนึ่งเดียวกับผู้ใด?", options: ["พระคริสต์", "ทูตสวรรค์", "โลก", "ธรรมบัญญัติ"], explanation: "แสดงถึงการตายและการเป็นขึ้นมาใหม่โดยเป็นหนึ่งเดียวกับพระคริสต์" },
            { question: "บัพติศมาที่ให้แก่บุตรของผู้เชื่อเรียกว่าอะไร?", options: ["บัพติศมาทารก", "การรับบัพติศมาซ้ำ", "การวางมือ", "พิธีมหาสนิท"], explanation: "เป็นบัพติศมาทารกที่ให้แก่บุตรแห่งพันธสัญญา (เพรสไบทีเรียนฮัปดง)" },
            { question: "เพรสไบทีเรียนฮัปดงเรียกบุตรของผู้เชื่อว่าอะไร?", options: ["บุตรแห่งพันธสัญญา", "แขก", "ผู้มาเยือน", "คนนอก"], explanation: "บุตรของผู้เชื่อเป็นบุตรแห่งพันธสัญญาที่อยู่ในพันธสัญญาของพระเจ้า" },
            { question: "บัพติศมารับด้วยสิ่งใด?", options: ["น้ำ", "น้ำมัน", "ไฟ", "เครื่องหอม"], explanation: "รับโดยการชำระด้วยน้ำ" },
            { question: "น้ำในบัพติศมาไม่ได้เป็นสัญลักษณ์ของสิ่งใด?", options: ["ทรัพย์สมบัติ", "การชำระบาป", "ชีวิตใหม่", "ความบริสุทธิ์"], explanation: "น้ำเป็นสัญลักษณ์ของการชำระบาป ชีวิตใหม่ และความบริสุทธิ์ (ไม่ใช่ทรัพย์สมบัติ)" },
            { question: "สำหรับผู้ใหญ่ ต้องมีสิ่งใดก่อนรับบัพติศมา?", options: ["การสารภาพความเชื่อในพระคริสต์", "การถวายเงินจำนวนมาก", "ประวัติการรับใช้", "การสอบผ่าน"], explanation: "รับบัพติศมาหลังจากสารภาพความเชื่อและการเชื่อฟัง" },
          ],
        },
        "2": {
          title: "การกลับใจและความเชื่อ",
          verse: "จงกลับใจใหม่ เพราะว่าแผ่นดินสวรรค์มาใกล้แล้ว",
          verseRef: "มัทธิว 4:17 (TSV)",
          teaching: [
            "การกลับใจคือการหันจากบาปและเปลี่ยนทิศทางของจิตใจและชีวิตมาหาพระเจ้า",
            "ความเชื่อคือการวางใจว่าพระเยซูทรงเป็นพระผู้ช่วยให้รอดของฉัน และมอบตัวเองทั้งหมดไว้กับพระองค์",
            "การกลับใจและความเชื่อเป็นทั้งการตัดสินใจครั้งเดียว และเป็นท่าทีของชีวิตที่ดำเนินต่อเนื่องตลอดชีวิต",
          ],
          questions: [
            { question: "การกลับใจคืออะไร?", options: ["หันจากบาปกลับมาหาพระเจ้า", "เพียงรู้สึกเสียใจ", "ถูกลงโทษ", "ลืมไป"], explanation: "การกลับใจไม่ใช่เพียงความเสียใจ แต่เป็นการเปลี่ยนทิศทาง" },
            { question: "ความเชื่อคืออะไร?", options: ["วางใจพระเยซูและมอบตัวไว้กับพระองค์", "เพียงความรู้", "ความรู้สึก", "โชค"], explanation: "ความเชื่อคือการวางใจและมอบตัวเองไว้" },
            { question: "การกลับใจและความเชื่อคงอยู่นานเพียงใด?", options: ["เป็นท่าทีของชีวิตตลอดชีวิต", "ครั้งเดียวก็จบ", "เฉพาะตอนรับบัพติศมา", "ไม่จำเป็น"], explanation: "การกลับใจและความเชื่อเป็นวิถีชีวิตตลอดชีวิต" },
            { question: "ในข้อ ‘จงกลับใจ เพราะ ___ มาใกล้แล้ว’ (มธ. 4:17) ช่องว่างคือ?", options: ["แผ่นดินสวรรค์", "การทดลอง", "จุดจบ", "พร"], explanation: "พระองค์ตรัสให้กลับใจ เพราะแผ่นดินสวรรค์มาใกล้แล้ว" },
            { question: "การกลับใจที่แท้จริงมีสิ่งใดตามมา?", options: ["การเปลี่ยนแปลงชีวิต (การหันกลับ)", "เพียงความเสียใจ", "ไม่มีการเปลี่ยนแปลง", "การโอ้อวด"], explanation: "การกลับใจเปลี่ยนทิศทางและนำไปสู่การเปลี่ยนแปลงชีวิต" },
            { question: "เป้าหมายของความเชื่อคือผู้ใด?", options: ["พระเยซูคริสต์", "ตัวเอง", "โลก", "โชค"], explanation: "ความเชื่อคือการวางใจและพึ่งพาพระเยซูคริสต์" },
            { question: "เราถูกนับว่าชอบธรรมโดยสิ่งใด?", options: ["โดยความเชื่อ", "โดยการประพฤติ", "โดยเงิน", "โดยเชื้อสาย"], explanation: "เราถูกนับว่าชอบธรรมโดยความเชื่อเท่านั้น (การนับว่าชอบธรรมโดยความเชื่อ)" },
            { question: "การกลับใจคือการหันจากสิ่งใดไปสู่สิ่งใด?", options: ["จากบาปมาหาพระเจ้า", "จากพระเจ้าไปสู่บาป", "จากคริสตจักรไปสู่โลก", "จากความสว่างไปสู่ความมืด"], explanation: "เป็นการหันจากบาปมาหาพระเจ้า" },
            { question: "ความเชื่อเป็นเพียงการรู้หรือไม่?", options: ["ไม่ เป็นการวางใจและมอบตัวไว้", "ใช่ ความรู้ก็พอแล้ว", "เป็นเพียงความรู้สึก", "ไม่ทราบ"], explanation: "ความเชื่อที่แท้จริงคือการวางใจและมอบตัวเองไว้" },
            { question: "เมื่อล้มลงในบาปอีกครั้ง ท่าทีที่ถูกต้องคืออะไร?", options: ["กลับใจและเข้ามาหาองค์พระผู้เป็นเจ้าอีกครั้ง", "ยอมแพ้", "ปิดบัง", "โทษตัวเองเท่านั้น"], explanation: "เรากลับใจและเข้ามาหาองค์พระผู้เป็นเจ้าอีกครั้ง" },
          ],
        },
        "3": {
          title: "ความมั่นใจในความรอด",
          verse: "… เพื่อให้ท่านทั้งหลายรู้ว่าท่านมีชีวิตนิรันดร์",
          verseRef: "1 ยอห์น 5:13 (TSV)",
          teaching: [
            "ความมั่นใจในความรอดไม่ได้ตั้งอยู่บนความรู้สึกของฉัน แต่ตั้งอยู่บนพระสัญญาของพระเจ้า (พระวจนะ)",
            "พระเจ้าทรงสัญญาอย่างชัดเจนว่าจะประทานชีวิตนิรันดร์แก่ผู้ที่เชื่อในพระเยซู",
            "เพราะฉะนั้น แม้เมื่อจิตใจหวั่นไหว เรายึดมั่นในพระสัญญาแห่งพระวจนะและมีสันติสุข",
          ],
          questions: [
            { question: "พื้นฐานของความมั่นใจในความรอดคืออะไร?", options: ["พระสัญญาของพระเจ้า (พระวจนะ)", "อารมณ์ของฉัน", "คำพูดของคนอื่น", "โชค"], explanation: "ความมั่นใจตั้งอยู่บนพระวจนะที่ไม่เปลี่ยนแปลง ไม่ใช่อารมณ์ที่เปลี่ยนไป" },
            { question: "พระเจ้าประทานสิ่งใดแก่ผู้ที่เชื่อในพระเยซู?", options: ["ชีวิตนิรันดร์", "ทรัพย์สมบัติ", "สุขภาพ", "ความสำเร็จ"], explanation: "ทรงประทานชีวิตนิรันดร์แก่ผู้เชื่อ (1ยน. 5:13)" },
            { question: "เมื่ออารมณ์หวั่นไหว เราทำอย่างไร?", options: ["ยึดมั่นในพระสัญญาแห่งพระวจนะ", "สงสัยในความรอด", "ยอมแพ้", "ไม่รู้"], explanation: "เมื่อเรายึดมั่นในพระสัญญา เรามีสันติสุข" },
            { question: "ความมั่นใจในความรอดตั้งอยู่บนสิ่งใด?", options: ["พระสัญญาของพระเจ้า (พระวจนะ)", "ความรู้สึกของฉัน", "คนอื่น", "สภาพแวดล้อม"], explanation: "ความมั่นใจตั้งอยู่บนพระวจนะที่ไม่เปลี่ยนแปลง" },
            { question: "พระเจ้าทรงสัญญาสิ่งใดแก่ผู้เชื่อ?", options: ["ชีวิตนิรันดร์", "ทรัพย์สมบัติ", "สุขภาพ", "ความสำเร็จ"], explanation: "ทรงประทานชีวิตนิรันดร์แก่ผู้เชื่อ (1ยน. 5:13)" },
            { question: "ความรอดคงอยู่ด้วยการประพฤติของฉันหรือไม่?", options: ["ไม่ พระเจ้าทรงยึดเราไว้", "ใช่ ด้วยการประพฤติของฉัน", "ไม่ทราบ", "ครึ่งๆ"], explanation: "พระเจ้าทรงยึดและทรงรักษาเราไว้จนถึงที่สุด" },
            { question: "สิ่งใดเป็นพื้นฐานที่ผิดซึ่งทำให้ความมั่นใจสั่นคลอน?", options: ["อารมณ์ของวันนั้น", "พระวจนะของพระเจ้า", "กางเขนของพระคริสต์", "ความสัตย์ซื่อของพระเจ้า"], explanation: "อารมณ์ที่เปลี่ยนไปไม่ใช่พื้นฐานของความมั่นใจ" },
            { question: "ฐานะ ‘บุตรของพระเจ้า’ ผู้ใดเป็นผู้ประทาน?", options: ["พระเจ้า", "ตัวฉันเอง", "คริสตจักร", "โลก"], explanation: "พระเจ้าทรงรับเราเป็นบุตร" },
            { question: "ชีวิตของผู้ที่มีความมั่นใจในความรอดเป็นอย่างไร?", options: ["ดำเนินชีวิตด้วยสันติสุขและการขอบพระคุณ", "วิตกกังวลเสมอ", "หยิ่งผยอง", "ไม่แยแส"], explanation: "ความมั่นใจนำไปสู่ชีวิตแห่งสันติสุขและการขอบพระคุณ" },
            { question: "ผู้ที่ได้รับความรอดจะเป็นอย่างไรจนถึงที่สุด?", options: ["พระเจ้าทรงปกป้องและทรงรักษาไว้", "สูญเสียบ่อยๆ", "รักษาไว้ด้วยตนเองเท่านั้น", "ไม่ทราบ"], explanation: "ธรรมิกชนได้รับการทรงรักษาไว้จนถึงที่สุด (ได้รับการปกป้อง)" },
          ],
        },
        "4": {
          title: "ชีวิตคริสเตียนและพิธีมหาสนิท",
          verse: "… จงทำอย่างนี้เพื่อระลึกถึงเรา",
          verseRef: "ลูกา 22:19 (TSV)",
          teaching: [
            "ผู้ที่ได้รับความรอดเชื่อฟังพระเจ้าด้วยใจขอบพระคุณ และค่อยๆ เป็นเหมือนพระเยซูมากขึ้น (การชำระให้บริสุทธิ์)",
            "ความเชื่อเติบโตผ่านการนมัสการ การอธิษฐาน พระวจนะ การสามัคคีธรรม และการรับใช้ ความเชื่อไม่ได้เติบโตโดยลำพัง แต่เติบโตในชุมชนของคริสตจักร",
            "พิธีมหาสนิท (พระกระยาหารขององค์พระผู้เป็นเจ้า) เป็นพิธีที่เราระลึกถึงกางเขนของพระเยซูด้วยขนมปังและถ้วย และจารึกพระคุณนั้นไว้ในใจ",
          ],
          questions: [
            { question: "ชีวิตของผู้ที่ได้รับความรอดเป็นอย่างไร?", options: ["เชื่อฟังด้วยใจขอบพระคุณและเป็นเหมือนพระเยซู", "ใช้ชีวิตตามใจชอบ", "ไม่มีการเปลี่ยนแปลง", "ทำเพียงภายนอก"], explanation: "เราดำเนินชีวิตที่บริสุทธิ์อันเป็นผลของความรอด" },
            { question: "สิ่งใดไม่ใช่ช่องทางให้ความเชื่อเติบโต?", options: ["การแยกตัวอยู่ลำพัง", "การนมัสการ", "การอธิษฐาน", "พระวจนะ"], explanation: "ความเชื่อเติบโตด้วยกันในชุมชน" },
            { question: "ความหมายของพิธีมหาสนิทคืออะไร?", options: ["การระลึกถึงกางเขนของพระเยซู", "มื้ออาหารธรรมดา", "การสังสรรค์", "โชค"], explanation: "พิธีมหาสนิทเป็นพิธีที่ระลึกถึงการสิ้นพระชนม์ขององค์พระผู้เป็นเจ้า" },
            { question: "การที่ผู้ได้รับความรอดค่อยๆ เป็นเหมือนพระเยซูเรียกว่าอะไร?", options: ["การชำระให้บริสุทธิ์", "การนับว่าชอบธรรม", "การทรงสร้าง", "การคืนพระชนม์"], explanation: "การเติบโตในความบริสุทธิ์จนเป็นเหมือนพระเยซูเรียกว่าการชำระให้บริสุทธิ์" },
            { question: "สิ่งใดไม่ใช่ช่องทางให้ความเชื่อเติบโต?", options: ["การแยกตัว", "การนมัสการ", "การอธิษฐาน", "พระวจนะ"], explanation: "ความเชื่อเติบโตผ่านการนมัสการ การอธิษฐาน พระวจนะ และการสามัคคีธรรม" },
            { question: "ในพิธีมหาสนิทใช้สิ่งใด?", options: ["ขนมปังและถ้วย", "น้ำ", "น้ำมัน", "เครื่องหอม"], explanation: "เราระลึกถึงพระกายและพระโลหิตขององค์พระผู้เป็นเจ้าด้วยขนมปังและถ้วย" },
            { question: "พิธีมหาสนิทระลึกถึงสิ่งใด?", options: ["กางเขนของพระเยซู (การสิ้นพระชนม์)", "งานเทศกาลอีสเตอร์", "วันเกิด", "การเก็บเกี่ยว"], explanation: "ระลึกถึงการสิ้นพระชนม์ขององค์พระผู้เป็นเจ้า (ลก. 22:19)" },
            { question: "เพื่อร่วมพิธีมหาสนิทอย่างสมควร ต้องมีสิ่งใด?", options: ["การพิจารณาตนเอง (การกลับใจและความเชื่อ)", "การถวายเงินจำนวนมาก", "ตำแหน่งในคริสตจักร", "ไม่ต้องมีคุณสมบัติพิเศษ"], explanation: "เราพิจารณาตนเองและร่วมพิธีด้วยการไตร่ตรอง (1คร. 11:28)" },
            { question: "คริสเตียนควรนมัสการอย่างไร?", options: ["ด้วยใจขอบพระคุณและสุดใจ", "อย่างเสียไม่ได้", "เพียงรูปแบบ", "ไม่นมัสการ"], explanation: "เรานมัสการอย่างสุดใจด้วยใจขอบพระคุณต่อพระคุณแห่งความรอด" },
            { question: "ความเชื่อเติบโตด้วยกันที่ใด?", options: ["ในชุมชนคริสตจักร", "โดยลำพังเท่านั้น", "บนอินเทอร์เน็ตเท่านั้น", "ไม่เติบโต"], explanation: "ความเชื่อเติบโตด้วยกันในชุมชนคริสตจักร" },
          ],
        },
      },
    },
  },
};
