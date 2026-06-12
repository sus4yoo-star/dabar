// =====================================================================
//  성경 말씀 본문 — 복음 전하기 도구(5종)에서 인용하는 구절 전체
//  verse_ref(출처)만으로는 본문이 안 보이므로, 여기서 실제 말씀을 제공한다.
//  키: 정규화된 "BOOK 장:절" (예: "JHN 3:16"). 언어: ko / en / th / lo
//  ※ 라오스어(lo) 본문은 라오스어 표준역(LSV) 문체로 작성하고, 의미를
//    공인 라오스 성경(Revised Lao Bible 2012 / laobible.net "ພຣະຄຳພີ ພາສາລາວ")과
//    대조해 확인했습니다. 복음 도구로 현장 사용하기 전, 라오스어 모어 신자의
//    최종 교정을 한 번 받는 것을 강력히 권장합니다.
// =====================================================================

type Tri = { ko: string; en: string; th: string; lo: string };
type VLang = "ko" | "en" | "th" | "lo";

// 책 약어 → 언어별 책 이름(라벨용)
const BOOK_NAMES: Record<string, Tri> = {
  GEN: { ko: "창세기", en: "Genesis", th: "ปฐมกาล", lo: "ປະຖົມມະການ" },
  ISA: { ko: "이사야", en: "Isaiah", th: "อิสยาห์", lo: "ເອຊາຢາ" },
  MRK: { ko: "마가복음", en: "Mark", th: "มาระโก", lo: "ມາລະໂກ" },
  JHN: { ko: "요한복음", en: "John", th: "ยอห์น", lo: "ໂຢຮັນ" },
  ROM: { ko: "로마서", en: "Romans", th: "โรม", lo: "ໂຣມ" },
  REV: { ko: "요한계시록", en: "Revelation", th: "วิวรณ์", lo: "ພະນິມິດ" },
  "2CO": { ko: "고린도후서", en: "2 Corinthians", th: "2 โครินธ์", lo: "2 ໂກລິນໂທ" },
  "1PE": { ko: "베드로전서", en: "1 Peter", th: "1 เปโตร", lo: "1 ເປໂຕ" },
  "2PE": { ko: "베드로후서", en: "2 Peter", th: "2 เปโตร", lo: "2 ເປໂຕ" },
};

// 책 이름(여러 언어 표기) → 약어. 검색은 소문자 substring 으로 한다.
const BOOK_ALIASES: { alias: string; code: string }[] = [
  { alias: "창세기", code: "GEN" }, { alias: "genesis", code: "GEN" }, { alias: "ปฐมกาล", code: "GEN" }, { alias: "ປະຖົມມະການ", code: "GEN" },
  { alias: "이사야", code: "ISA" }, { alias: "isaiah", code: "ISA" }, { alias: "อิสยาห์", code: "ISA" }, { alias: "ເອຊາຢາ", code: "ISA" },
  { alias: "마가복음", code: "MRK" }, { alias: "마가", code: "MRK" }, { alias: "mark", code: "MRK" }, { alias: "มาระโก", code: "MRK" }, { alias: "ມາລະໂກ", code: "MRK" },
  // 요한계시록을 요한복음보다 먼저 검사 (substring 충돌 방지)
  { alias: "요한계시록", code: "REV" }, { alias: "계시록", code: "REV" }, { alias: "revelation", code: "REV" }, { alias: "วิวรณ์", code: "REV" }, { alias: "ພະນິມິດ", code: "REV" },
  { alias: "요한복음", code: "JHN" }, { alias: "john", code: "JHN" }, { alias: "ยอห์น", code: "JHN" }, { alias: "ໂຢຮັນ", code: "JHN" },
  { alias: "로마서", code: "ROM" }, { alias: "로마", code: "ROM" }, { alias: "romans", code: "ROM" }, { alias: "โรม", code: "ROM" }, { alias: "ໂຣມ", code: "ROM" },
  { alias: "고린도후서", code: "2CO" }, { alias: "2 corinthians", code: "2CO" }, { alias: "2corinthians", code: "2CO" }, { alias: "โครินธ์", code: "2CO" }, { alias: "ໂກລິນໂທ", code: "2CO" },
  { alias: "베드로후서", code: "2PE" }, { alias: "2 peter", code: "2PE" }, { alias: "2peter", code: "2PE" }, { alias: "2 เปโตร", code: "2PE" }, { alias: "2เปโตร", code: "2PE" }, { alias: "2 ເປໂຕ", code: "2PE" }, { alias: "2ເປໂຕ", code: "2PE" },
  { alias: "베드로전서", code: "1PE" }, { alias: "1 peter", code: "1PE" }, { alias: "1peter", code: "1PE" }, { alias: "เปโตร", code: "1PE" }, { alias: "ເປໂຕ", code: "1PE" },
];

// 말씀 본문 (개역개정 / 영문 / 태국어 / 라오스어 표준역 계열)
export const VERSES: Record<string, Tri> = {
  "GEN 1:31": {
    ko: "하나님이 지으신 그 모든 것을 보시니 보시기에 심히 좋았더라.",
    en: "God saw all that he had made, and it was very good.",
    th: "พระเจ้าทอดพระเนตรสิ่งทั้งปวงที่พระองค์ทรงสร้างไว้ ทรงเห็นว่าดียิ่งนัก",
    lo: "ພຣະເຈົ້າໄດ້ທອດພຣະເນດເບິ່ງສັບພະທຸກສິ່ງທີ່ພຣະອົງໄດ້ສ້າງໄວ້ ແລະ ເຫັນວ່າດີຍິ່ງນັກ",
  },
  "ISA 1:18": {
    ko: "너희의 죄가 주홍 같을지라도 눈과 같이 희어질 것이요 진홍 같이 붉을지라도 양털 같이 희게 되리라.",
    en: "Though your sins are like scarlet, they shall be as white as snow; though they are red like crimson, they shall become like wool.",
    th: "บาปของเจ้าแม้เป็นสีแดงเข้ม ก็จะขาวอย่างหิมะ แม้จะแดงอย่างผ้าแดง ก็จะกลายเป็นอย่างขนแกะ",
    lo: "ເຖິງແມ່ນບາບຂອງເຈົ້າຈະເປັນສີແດງເຂັ້ມ ກໍຈະຂາວຄືຫິມະ ເຖິງຈະແດງຄືຜ້າແດງ ກໍຈະກາຍເປັນຄືຂົນແກະ",
  },
  "ISA 59:2": {
    ko: "오직 너희 죄악이 너희와 너희 하나님 사이를 갈라 놓았고 너희 죄가 그의 얼굴을 가리어서 너희에게서 듣지 않으시게 함이라.",
    en: "But your iniquities have separated you from your God; your sins have hidden his face from you, so that he will not hear.",
    th: "แต่ความชั่วช้าของเจ้าได้กระทำให้เกิดการแยกระหว่างเจ้ากับพระเจ้าของเจ้า และบาปของเจ้าได้บังพระพักตร์ของพระองค์เสียจากเจ้า พระองค์จึงมิได้ทรงสดับ",
    lo: "ແຕ່ຄວາມຊົ່ວຮ້າຍຂອງເຈົ້າໄດ້ແຍກເຈົ້າອອກຈາກພຣະເຈົ້າຂອງເຈົ້າ ແລະ ບາບຂອງເຈົ້າໄດ້ບັງພຣະພັກຂອງພຣະອົງຈາກເຈົ້າ ພຣະອົງຈຶ່ງບໍ່ໄດ້ຍິນ",
  },
  "MRK 1:15": {
    ko: "이르시되 때가 찼고 하나님의 나라가 가까이 왔으니 회개하고 복음을 믿으라 하시더라.",
    en: "“The time has come,” he said. “The kingdom of God has come near. Repent and believe the good news!”",
    th: "และตรัสว่า เวลากำหนดมาถึงแล้ว และแผ่นดินของพระเจ้าก็มาใกล้แล้ว จงกลับใจเสียใหม่และเชื่อข่าวประเสริฐเถิด",
    lo: "ພຣະອົງຊົງກ່າວວ່າ ເຖິງເວລາກຳນົດແລ້ວ ແລະ ລາຊະອານາຈັກຂອງພຣະເຈົ້າມາໃກ້ແລ້ວ ຈົ່ງກັບໃຈໃໝ່ ແລະ ເຊື່ອຂ່າວປະເສີດເຖີດ",
  },
  "JHN 1:12": {
    ko: "영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨으니.",
    en: "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.",
    th: "แต่ทุกคนที่ต้อนรับพระองค์ คือคนที่เชื่อในพระนามของพระองค์ พระองค์ก็ทรงประทานสิทธิให้เป็นบุตรของพระเจ้า",
    lo: "ແຕ່ທຸກຄົນທີ່ຕ້ອນຮັບພຣະອົງ ຄືຜູ້ທີ່ເຊື່ອໃນພຣະນາມຂອງພຣະອົງ ພຣະອົງຊົງປະທານສິດໃຫ້ເປັນບຸດຂອງພຣະເຈົ້າ",
  },
  "JHN 3:16": {
    ko: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라.",
    en: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    th: "เพราะว่าพระเจ้าทรงรักโลก จนได้ประทานพระบุตรองค์เดียวของพระองค์ เพื่อทุกคนที่เชื่อในพระบุตรนั้นจะไม่พินาศ แต่มีชีวิตนิรันดร์",
    lo: "ເພາະວ່າພຣະເຈົ້າຊົງຮັກໂລກ ຈົນໄດ້ປະທານພຣະບຸດອົງດຽວຂອງພຣະອົງ ເພື່ອທຸກຄົນທີ່ເຊື່ອໃນພຣະບຸດນັ້ນຈະບໍ່ພິນາດ ແຕ່ມີຊີວິດນິລັນດອນ",
  },
  "JHN 5:24": {
    ko: "내가 진실로 진실로 너희에게 이르노니 내 말을 듣고 또 나 보내신 이를 믿는 자는 영생을 얻었고 심판에 이르지 아니하나니 사망에서 생명으로 옮겼느니라.",
    en: "Truly, truly, I say to you, whoever hears my word and believes him who sent me has eternal life. He does not come into judgment, but has passed from death to life.",
    th: "เราบอกความจริงแก่ท่านทั้งหลายว่า ถ้าผู้ใดฟังคำของเราและวางใจในพระองค์ผู้ทรงใช้เรามา ผู้นั้นก็มีชีวิตนิรันดร์ และไม่ถูกพิพากษา แต่ได้ผ่านพ้นความตายไปสู่ชีวิตแล้ว",
    lo: "ເຮົາບອກຄວາມຈິງແກ່ພວກທ່ານວ່າ ຖ້າຜູ້ໃດຟັງຄຳຂອງເຮົາ ແລະ ເຊື່ອໃນພຣະອົງຜູ້ຊົງໃຊ້ເຮົາມາ ຜູ້ນັ້ນກໍມີຊີວິດນິລັນດອນ ແລະ ບໍ່ຖືກພິພາກສາ ແຕ່ໄດ້ຜ່ານພົ້ນຈາກຄວາມຕາຍໄປສູ່ຊີວິດແລ້ວ",
  },
  "JHN 10:10": {
    ko: "내가 온 것은 양으로 생명을 얻게 하고 더 풍성히 얻게 하려는 것이라.",
    en: "I have come that they may have life, and have it to the full.",
    th: "เราได้มาเพื่อเขาทั้งหลายจะได้ชีวิต และจะได้อย่างครบบริบูรณ์",
    lo: "ເຮົາໄດ້ມາເພື່ອໃຫ້ເຂົາທັງຫຼາຍມີຊີວິດ ແລະ ມີຢ່າງຄົບບໍລິບູນ",
  },
  "JHN 14:6": {
    ko: "예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라.",
    en: "Jesus answered, “I am the way and the truth and the life. No one comes to the Father except through me.”",
    th: "พระเยซูตรัสว่า เราเป็นทางนั้น เป็นความจริง และเป็นชีวิต ไม่มีผู้ใดมาถึงพระบิดาได้นอกจากจะมาทางเรา",
    lo: "ພຣະເຢຊູຊົງກ່າວວ່າ ເຮົາເປັນທາງນັ້ນ ເປັນຄວາມຈິງ ແລະ ເປັນຊີວິດ ບໍ່ມີຜູ້ໃດມາເຖິງພຣະບິດາໄດ້ ນອກຈາກຈະມາທາງເຮົາ",
  },
  "ROM 3:23": {
    ko: "모든 사람이 죄를 범하였으매 하나님의 영광에 이르지 못하더니.",
    en: "For all have sinned and fall short of the glory of God.",
    th: "เพราะว่าทุกคนทำบาป และเสื่อมจากพระสิริของพระเจ้า",
    lo: "ເພາະວ່າທຸກຄົນໄດ້ເຮັດບາບ ແລະ ເສື່ອມຈາກລັດສະໝີຂອງພຣະເຈົ້າ",
  },
  "ROM 5:8": {
    ko: "우리가 아직 죄인 되었을 때에 그리스도께서 우리를 위하여 죽으심으로 하나님께서 우리에 대한 자기의 사랑을 확증하셨느니라.",
    en: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.",
    th: "แต่พระเจ้าทรงสำแดงความรักของพระองค์แก่เราทั้งหลาย คือขณะที่เรายังเป็นคนบาปอยู่นั้น พระคริสต์ได้ทรงสิ้นพระชนม์เพื่อเรา",
    lo: "ແຕ່ພຣະເຈົ້າຊົງສຳແດງຄວາມຮັກຂອງພຣະອົງຕໍ່ເຮົາທັງຫຼາຍ ຄືຂະນະທີ່ເຮົາຍັງເປັນຄົນບາບຢູ່ນັ້ນ ພຣະຄຣິດໄດ້ສິ້ນພຣະຊົນເພື່ອເຮົາ",
  },
  "ROM 6:23": {
    ko: "죄의 삯은 사망이요 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라.",
    en: "For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.",
    th: "เพราะว่าค่าจ้างของบาปคือความตาย แต่ของประทานจากพระเจ้าคือชีวิตนิรันดร์ในพระเยซูคริสต์องค์พระผู้เป็นเจ้าของเรา",
    lo: "ເພາະວ່າຄ່າຈ້າງຂອງບາບຄືຄວາມຕາຍ ແຕ່ຂອງປະທານຈາກພຣະເຈົ້າຄືຊີວິດນິລັນດອນໃນພຣະເຢຊູຄຣິດ ອົງພຣະຜູ້ເປັນເຈົ້າຂອງເຮົາ",
  },
  "ROM 10:9": {
    ko: "네가 만일 네 입으로 예수를 주로 시인하며 또 하나님께서 그를 죽은 자 가운데서 살리신 것을 네 마음에 믿으면 구원을 받으리라.",
    en: "If you declare with your mouth, “Jesus is Lord,” and believe in your heart that God raised him from the dead, you will be saved.",
    th: "คือว่าถ้าท่านจะรับด้วยปากของท่านว่า พระเยซูทรงเป็นองค์พระผู้เป็นเจ้า และเชื่อในใจว่าพระเจ้าได้ทรงให้พระองค์เป็นขึ้นมาจากความตาย ท่านจะรอด",
    lo: "ຄືວ່າຖ້າທ່ານຈະຮັບດ້ວຍປາກຂອງທ່ານວ່າ ພຣະເຢຊູຊົງເປັນອົງພຣະຜູ້ເປັນເຈົ້າ ແລະ ເຊື່ອໃນໃຈວ່າພຣະເຈົ້າໄດ້ຊົງໃຫ້ພຣະອົງຄືນມາຈາກຕາຍ ທ່ານກໍຈະລອດ",
  },
  "ROM 10:13": {
    ko: "누구든지 주의 이름을 부르는 자는 구원을 받으리라.",
    en: "For everyone who calls on the name of the Lord will be saved.",
    th: "เพราะว่าทุกคนที่ร้องออกพระนามขององค์พระผู้เป็นเจ้าจะรอด",
    lo: "ເພາະວ່າທຸກຄົນທີ່ຮ້ອງອອກພຣະນາມຂອງອົງພຣະຜູ້ເປັນເຈົ້າຈະລອດ",
  },
  "REV 3:20": {
    ko: "볼지어다 내가 문 밖에 서서 두드리노니 누구든지 내 음성을 듣고 문을 열면 내가 그에게로 들어가 그와 더불어 먹고 그는 나와 더불어 먹으리라.",
    en: "Here I am! I stand at the door and knock. If anyone hears my voice and opens the door, I will come in and eat with that person, and they with me.",
    th: "นี่แน่ะ เรายืนเคาะอยู่ที่ประตู ถ้าผู้ใดได้ยินเสียงของเราและเปิดประตู เราจะเข้าไปหาผู้นั้น และจะรับประทานอาหารร่วมกับเขา และเขาจะรับประทานร่วมกับเรา",
    lo: "ເບິ່ງແມ້ ເຮົາຢືນເຄາະຢູ່ທີ່ປະຕູ ຖ້າຜູ້ໃດໄດ້ຍິນສຽງຂອງເຮົາ ແລະ ເປີດປະຕູ ເຮົາຈະເຂົ້າໄປຫາຜູ້ນັ້ນ ແລະ ຈະຮັບປະທານອາຫານຮ່ວມກັບເຂົາ ແລະ ເຂົາຈະຮັບປະທານຮ່ວມກັບເຮົາ",
  },
  "2CO 5:17": {
    ko: "그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다.",
    en: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
    th: "เหตุฉะนั้นถ้าผู้ใดอยู่ในพระคริสต์ ผู้นั้นก็เป็นคนที่ถูกสร้างใหม่แล้ว สิ่งเก่าๆ ก็ล่วงไป ดูเถิด สิ่งสารพัดกลายเป็นสิ่งใหม่ทั้งนั้น",
    lo: "ສະນັ້ນ ຖ້າຜູ້ໃດຢູ່ໃນພຣະຄຣິດ ຜູ້ນັ້ນກໍເປັນຄົນທີ່ຖືກສ້າງໃໝ່ແລ້ວ ສິ່ງເກົ່າໆກໍລ່ວງໄປ ເບິ່ງແມ້ ສິ່ງສາລະພັດກາຍເປັນສິ່ງໃໝ່",
  },
  "1PE 3:18": {
    ko: "그리스도께서도 단번에 죄를 위하여 죽으사 의인으로서 불의한 자를 대신하셨으니 이는 우리를 하나님 앞으로 인도하려 하심이라.",
    en: "For Christ also suffered once for sins, the righteous for the unrighteous, to bring you to God.",
    th: "ด้วยว่าพระคริสต์ก็ได้ทรงทนทุกข์ครั้งเดียวเพราะบาป คือพระองค์ผู้ชอบธรรมเพื่อผู้ไม่ชอบธรรม เพื่อจะได้ทรงนำเราทั้งหลายไปถึงพระเจ้า",
    lo: "ດ້ວຍວ່າພຣະຄຣິດກໍໄດ້ຊົງທົນທຸກຍ້ອນບາບຄັ້ງດຽວເທົ່ານັ້ນ ຄືພຣະອົງຜູ້ຊອບທຳເພື່ອຜູ້ບໍ່ຊອບທຳ ເພື່ອຈະຊົງນຳເຮົາທັງຫຼາຍໄປເຖິງພຣະເຈົ້າ",
  },
  "2PE 3:18": {
    ko: "오직 우리 주 곧 구주 예수 그리스도의 은혜와 그를 아는 지식에서 자라 가라.",
    en: "But grow in the grace and knowledge of our Lord and Savior Jesus Christ.",
    th: "แต่ขอท่านทั้งหลายจงเจริญขึ้นในพระคุณและในความรู้ซึ่งมาจากพระเยซูคริสต์องค์พระผู้เป็นเจ้าและพระผู้ช่วยให้รอดของเรา",
    lo: "ແຕ່ຈົ່ງຈະເລີນຂຶ້ນໃນພຣະຄຸນ ແລະ ໃນຄວາມຮູ້ຂອງພຣະເຢຊູຄຣິດ ອົງພຣະຜູ້ເປັນເຈົ້າ ແລະ ພຣະຜູ້ຊ່ວຍໃຫ້ລອດຂອງເຮົາ",
  },
};

export type VersePassage = { key: string; label: string; text: string };

// "요한복음 3:16 · 10:10" / "John 3:16; 10:10" / "โรม 3:23, 6:23" 등을 파싱
export function versesFor(ref: string | null | undefined, lang: string): VersePassage[] {
  if (!ref) return [];
  const L: VLang = (lang === "en" || lang === "th" || lang === "lo") ? lang : "ko";
  const out: VersePassage[] = [];
  let currentBook: string | null = null;

  // 구분자: ; · , 、 / 줄바꿈
  const segments = ref.split(/[;·,、/\n]+/).map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    const low = seg.toLowerCase();
    // 이 조각에 책 이름이 있으면 갱신 (가장 먼저 매칭되는 alias)
    for (const { alias, code } of BOOK_ALIASES) {
      if (low.includes(alias.toLowerCase())) { currentBook = code; break; }
    }
    if (!currentBook) continue;
    // 장:절 (절 범위 "16-18" 은 시작 절만)
    const m = seg.match(/(\d+)\s*:\s*(\d+)/);
    if (!m) continue;
    const key = `${currentBook} ${m[1]}:${m[2]}`;
    const v = VERSES[key];
    if (!v) continue;
    if (out.some((o) => o.key === key)) continue; // 중복 방지
    const bn = BOOK_NAMES[currentBook]?.[L] ?? currentBook;
    out.push({ key, label: `${bn} ${m[1]}:${m[2]}`, text: v[L] });
  }
  return out;
}
