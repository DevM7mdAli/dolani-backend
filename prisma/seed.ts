import { PrismaPg } from '@prisma/adapter-pg';
import { DeptType, LocationType, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

// 1. Create the pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. THE SILVER BULLET: Explicitly pass the schema to the adapter options!
const adapter = new PrismaPg(pool, { schema: 'dolani_api' });

// 3. Initialize Prisma
const prisma = new PrismaClient({ adapter });

const rawRooms = [
  //* doctors in COE Finished Fill
  {
    roomNumber: '1092',
    floor: '2',
    department: 'هندسة الحاسب الآلي',
    doctor: 'د. مصطفى يولداش',
    Demail: 'mmzyouldash@iau.edu.sa',
  },
  {
    roomNumber: '1093',
    floor: '2',
    department: 'هندسة الحاسب الآلي',
    doctor: 'د. علي المدن',
    Demail: 'aaalmadan@iau.edu.sa',
  },
  {
    roomNumber: '1090',
    floor: '2',
    department: 'هندسة الحاسب الآلي',
    doctor: 'د. نواف الحربي',
    Demail: 'nmsalharbi@iau.edu.sa',
  },
  {
    roomNumber: '1084',
    floor: '2',
    department: 'هندسة الحاسب الآلي',
    doctor: 'د. عرفان الله عبد الرب',
    Demail: 'iurab@iau.edu.sa',
  },
  {
    roomNumber: '1058',
    floor: '2',
    department: 'هندسة الحاسب الآلي',
    doctor: 'د. امل الاحمدي',
    Demail: 'aaalahmadi@iau.edu.sa',
  },
  {
    roomNumber: '1094',
    floor: '2',
    department: 'هندسة الحاسب الآلي',
    doctor: 'د. سانداي اولاتينجي (آدم)',
    Demail: 'osunday@iau.edu.sa',
  },

  //!COE class area and others
  { roomNumber: 'F1060', floor: '2', department: 'هندسة الحاسب الآلي', type: 'قاعة' },

  //*doctors in CS Finished Fill
  {
    roomNumber: '1183',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'أ. محمد صالح كاندي',
    Demail: 'msAhmed@iau.edu.sa',
  },
  {
    roomNumber: '1173',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. فرمان الله جان',
    Demail: 'fzmjan@iau.edu.sa',
  },
  {
    roomNumber: '1159',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'أ. عبدالله المقحم',
    Demail: 'aalmuqhim@iau.edu.sa',
  },
  {
    roomNumber: '1161',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. نهاد ابراهيم',
    Demail: 'nmaIbrahim@iau.edu.sa',
  },
  { roomNumber: '1163', floor: '2', department: 'علوم الحاسب', doctor: 'د. ضياء مصلح', Demail: 'damusleh@iau.edu.sa' },
  {
    roomNumber: '1164',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'أ.د. نصرو من الله',
    Demail: 'nabdullatief@iau.edu.sa',
  },
  {
    roomNumber: '1165',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. عطاء الرحمن',
    Demail: 'aaurrahman@iau.edu.sa',
  },
  { roomNumber: '1174', floor: '2', department: 'علوم الحاسب', doctor: 'د. محمد عمران', Demail: 'mbahmed@iau.edu.sa' },
  {
    roomNumber: '1175',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. ياسر القويفلي',
    Demail: 'ymalguwaifli@iau.edu.sa',
  },
  { roomNumber: '1187', floor: '2', department: 'علوم الحاسب', doctor: 'أ. أفتاب خان', Demail: 'mkhan@iau.edu.sa' },
  {
    roomNumber: '1166',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. طارق الخالدي',
    Demail: 'talkhaledi@iau.edu.sa',
  },
  { roomNumber: '1167', floor: '2', department: 'علوم الحاسب', doctor: 'د. عمر مسلمي', Demail: 'oamasmali@iau.edu.sa' },
  {
    roomNumber: '1172',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. سعيد الشهراني',
    Demail: 'smshahrani@iau.edu.sa',
  },
  {
    roomNumber: '1176',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. علي العثمان',
    Demail: 'aauthman@iau.edu.sa',
  },
  {
    roomNumber: '1177',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. مكرم حمودة',
    Demail: 'mmhamouda@iau.edu.sa',
  },
  { roomNumber: '1178', floor: '2', department: 'علوم الحاسب', doctor: 'محمد حمزة', Demail: 'mahamza@iau.edu.sa' },
  { roomNumber: '1182', floor: '2', department: 'علوم الحاسب', doctor: 'الاسعد بنصر', Demail: 'aabensar@iau.edu.sa' },
  {
    roomNumber: '1196',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. عبدالعزيز الذياب',
    Demail: 'akaldiab@iau.edu.sa',
  },
  {
    roomNumber: '1188',
    floor: '2',
    department: 'علوم الحاسب',
    doctor: 'د. سمية الجميل',
    Demail: 'saljameel@iau.edu.sa',
  },

  //!CS class area and others
  { roomNumber: '1190', floor: '2', department: 'علوم الحاسب', type: 'قاعة' },
  { roomNumber: '1191', floor: '2', department: 'علوم الحاسب', type: 'قاعة' },
  { roomNumber: '1192', floor: '2', department: 'علوم الحاسب', type: 'قاعة' },
  { roomNumber: '1193', floor: '2', department: 'علوم الحاسب', type: 'قاعة' },
  { roomNumber: '1199', floor: '2', department: 'علوم الحاسب', type: 'قاعة' },
  { roomNumber: '1169', floor: '2', department: 'علوم الحاسب', type: 'استراحة' },
  { roomNumber: '1179', floor: '2', department: 'علوم الحاسب', type: 'مخرج' },

  //*CIS doctors Finished Fill
  {
    roomNumber: '1128',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. دينا العباد',
    Demail: 'daalabbad@iau.edu.sa',
  },
  {
    roomNumber: '1127',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'عبدالوهاب الماجد',
    Demail: 'analmajed@iau.edu.sa',
  },
  {
    roomNumber: '1123',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'أ. يوسف المنصور',
    Demail: 'yzalmunsour@iau.edu.sa',
  },
  {
    roomNumber: '1117',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. ياسر بامعروف',
    Demail: 'yabamarouf@iau.edu.sa',
  },
  {
    roomNumber: '1116',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. محمد القحطاني',
    Demail: 'maqhtani@iau.edu.sa',
  },
  {
    roomNumber: '1115',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. عبدالله القحطاني',
    Demail: 'aamqahtani@iau.edu.sa',
  },
  {
    roomNumber: '1122',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'أ. سردار اقبال',
    Demail: 'saiqbal@iau.edu.sa',
  },
  {
    roomNumber: '1114',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. نهير الظفيري',
    Demail: 'naldhafeeri@iau.edu.sa',
  },
  {
    roomNumber: '1113',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. ساقب سعيد',
    Demail: 'sbsaed@iau.edu.sa',
  },
  { roomNumber: '1108', floor: '2', department: 'نظم المعلومات الحاسوبية', doctor: 'د. يوسف الموسى', Demail: '' },
  {
    roomNumber: '1105',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'أ. سعيد القحطاني',
    Demail: 'shaqahtani@iau.edu.sa',
  },
  {
    roomNumber: '1107',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. رامي محمد',
    Demail: 'rmmohammad@iau.edu.sa',
  },
  {
    roomNumber: '1104',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. محمد جلوبالي',
    Demail: 'magollapalli@iau.edu.sa',
  },
  {
    roomNumber: '1103',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. فهد الحيدري',
    Demail: 'faalhaidari@iau.edu.sa',
  },
  {
    roomNumber: '1102',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'د. رشيد زغروبة',
    Demail: 'rmzagrouba@iau.edu.sa',
  },
  {
    roomNumber: '1100',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'ثامر الجهني',
    Demail: 'thsaljohani@iau.edu.sa',
  },
  {
    roomNumber: '1106',
    floor: '2',
    department: 'نظم المعلومات الحاسوبية',
    doctor: 'أ. الصغير شعباني',
    Demail: 'srchabani@iau.edu.sa',
  },

  //!CIS class area and others
  { roomNumber: '1139', floor: '2', department: 'نظم المعلومات الحاسوبية', type: 'قاعة' },
  { roomNumber: '1133', floor: '2', department: 'نظم المعلومات الحاسوبية', type: 'قاعة' },
  { roomNumber: '1132', floor: '2', department: 'نظم المعلومات الحاسوبية', type: 'قاعة' },
  { roomNumber: '1131', floor: '2', department: 'نظم المعلومات الحاسوبية', type: 'قاعة' },
  { roomNumber: '1130', floor: '2', department: 'نظم المعلومات الحاسوبية', type: 'قاعة' },
  { roomNumber: '1120', floor: '2', department: 'نظم المعلومات الحاسوبية', type: 'غرفة طباعة' },
  { roomNumber: '1110', floor: '2', department: 'نظم المعلومات الحاسوبية', type: 'استراحة' },
  { roomNumber: '1119', floor: '2', department: 'نظم المعلومات الحاسوبية', type: 'مخرج' },

  //*NC doctors Finished Fill
  {
    roomNumber: '1250',
    floor: '2',
    department: 'الشبكات والاتصالات',
    doctor: 'د. ديمة القحطاني',
    Demail: 'daalqahtani@iau.edu.sa',
  },
  {
    roomNumber: '1226',
    floor: '2',
    department: 'الشبكات والاتصالات',
    doctor: 'د. عبدالله المهيدب',
    Demail: 'amalmuhaideb@iau.edu.sa',
  },
  {
    roomNumber: '1225',
    floor: '2',
    department: 'الشبكات والاتصالات',
    doctor: 'د. عبدالرحمن الحربي',
    Demail: 'aalharby@iau.edu.sa',
  },
  {
    roomNumber: '1224',
    floor: '2',
    department: 'الشبكات والاتصالات',
    doctor: 'د. خالد العيسى',
    Demail: 'kaalissa@iau.edu.sa',
  },
  {
    roomNumber: '1222',
    floor: '2',
    department: 'الشبكات والاتصالات',
    doctor: 'أ. عبدالرحمن المهيدب',
    Demail: 'asmalmuhaidib@iau.edu.sa',
  },
  {
    roomNumber: '1218',
    floor: '2',
    department: 'الشبكات والاتصالات',
    doctor: 'أ. سعد الحارثي',
    Demail: 'saalharthi@iau.edu.sa',
  },
  {
    roomNumber: '1210',
    floor: '2',
    department: 'الشبكات والاتصالات',
    doctor: 'أ.د. نزر ساقب',
    Demail: 'nasaqib@iau.edu.sa',
  },
  {
    roomNumber: '1214',
    floor: '2',
    department: 'الشبكات والاتصالات',
    doctor: 'د. نايا ناجي',
    Demail: 'nmnagy@iau.edu.sa',
  },

  //! Lab 1
  { roomNumber: 'G116', floor: '1', department: 'معمل 1', type: 'معمل حاسب' },
  { roomNumber: 'G102', floor: '1', department: 'معمل 1', type: 'قاعة' },
  { roomNumber: 'G112', floor: '1', department: 'معمل 1', type: 'قاعة' },
  { roomNumber: 'G128', floor: '1', department: 'معمل 1', type: 'قاعة' },
  { roomNumber: 'G130', floor: '1', department: 'معمل 1', type: 'قاعة' },
  { roomNumber: 'G133', floor: '1', department: 'معمل 1', type: 'قاعة' },
  { roomNumber: 'G139', floor: '1', department: 'معمل 1', type: 'قاعة' },
  { roomNumber: 'G131.A', floor: '1', department: 'معمل 1', type: 'مخزن' },
  { roomNumber: 'G131.B', floor: '1', department: 'معمل 1', type: 'مصلى سيدات' },
  { roomNumber: 'G119', floor: '1', department: 'معمل 1', type: 'مخرج' },

  //! Lab 3
  { roomNumber: 'G161', floor: '1', department: 'معمل 3', type: 'نادي الأمن السيبراني' },
  { roomNumber: 'G172', floor: '1', department: 'معمل 3', type: 'قاعة' },
  { roomNumber: 'G176', floor: '1', department: 'معمل 3', type: 'معمل حاسب' },
  { roomNumber: 'G188', floor: '1', department: 'معمل 3', type: 'معمل حاسب' },
  { roomNumber: 'G190', floor: '1', department: 'معمل 3', type: 'معمل حاسب' },
  { roomNumber: 'G193.A', floor: '1', department: 'معمل 3', type: 'معمل حاسب' },
  { roomNumber: 'G199', floor: '1', department: 'معمل 3', type: 'معمل حاسب' },
  { roomNumber: 'G195', floor: '1', department: 'معمل 3', type: 'مكتب اداري' },
  { roomNumber: 'G196', floor: '1', department: 'معمل 3', type: 'مكتب اداري' },
  { roomNumber: 'G191.A', floor: '1', department: 'معمل 3', type: 'مكتب اداري' },
  { roomNumber: 'G191.B', floor: '1', department: 'معمل 3', type: 'مكتب اداري' },
  { roomNumber: 'G175.A', floor: '1', department: 'معمل 3', type: 'مكتب اداري' },
  { roomNumber: 'G175.B', floor: '1', department: 'معمل 3', type: 'مكتب اداري' },
  { roomNumber: 'G175', floor: '1', department: 'معمل 3', type: 'خزائن' },
  { roomNumber: 'G179', floor: '1', department: 'معمل 3', type: 'درج' },

  //! البهو الطابق الاول
  { roomNumber: 'G028', floor: '1', department: 'البهو', type: 'المسرح الرئيسي' },
  { roomNumber: 'G032', floor: '1', department: 'البهو', type: 'المسرح الرئيسي' },
  { roomNumber: 'G034', floor: '1', department: 'البهو', type: 'صالة كبار الشخصيات' },

  //! البهو الطابق الثاني
  { roomNumber: '1021', floor: '2', department: 'البهو', type: 'مسرح ١' },
  { roomNumber: '1028', floor: '2', department: 'البهو', type: 'غرفة نقاش' },
  { roomNumber: '1032', floor: '2', department: 'البهو', type: 'غرفة' },
  { roomNumber: '1037', floor: '2', department: 'البهو', type: 'مسرح ٢' },
  { roomNumber: '1034', floor: '2', department: 'البهو', type: 'استراحة' },
  { roomNumber: '1140', floor: '2', department: 'البهو', type: 'دورة مياه طلاب' },
  { roomNumber: '1046', floor: '2', department: 'البهو', type: 'بهو انتظار' },
  { roomNumber: '1049', floor: '2', department: 'البهو', type: 'دورة مياه طلاب' },
  { roomNumber: '1056', floor: '2', department: 'البهو', type: 'قاعة أختبارات يسار' },
  { roomNumber: '1004', floor: '2', department: 'البهو', type: 'قاعة أختبارات يمين' },
  { roomNumber: '1010', floor: '2', department: 'البهو', type: 'دورة مياه طالبات' },
  { roomNumber: '1014', floor: '2', department: 'البهو', type: 'بهو انتظار' },
  { roomNumber: '1011', floor: '2', department: 'البهو', type: 'درج' },
  { roomNumber: '1020', floor: '2', department: 'البهو', type: 'دورة مياه طلاب' },

  //! Lab 4
  { roomNumber: '1175', floor: '2', department: 'معمل 4', type: 'مخرج' },
  { roomNumber: '1154', floor: '2', department: 'معمل 4', type: 'معمل الروبوت' },
  { roomNumber: '1151', floor: '2', department: 'معمل 4', type: 'غرفة الشبكات' },
  { roomNumber: '1152', floor: '2', department: 'معمل 4', type: 'مكتب اداري' },
  { roomNumber: '1147', floor: '2', department: 'معمل 4', type: 'قاعة' },
  { roomNumber: '1140', floor: '2', department: 'معمل 4', type: 'معمل الشبكات' },

  //! قاعات الطابق الثالث مقابل المصعد
  { roomNumber: '2140.B', floor: '3', department: 'قاعات الطابق الثالث مقابل المصعد', type: 'قاعة' },
  { roomNumber: '2145.A', floor: '3', department: 'قاعات الطابق الثالث مقابل المصعد', type: 'قاعة' },
  { roomNumber: '2175', floor: '3', department: 'قاعات الطابق الثالث مقابل المصعد', type: 'مخرج' },
  { roomNumber: '2154', floor: '3', department: 'قاعات الطابق الثالث مقابل المصعد', type: 'قاعة' },

  //! البهو الطابق الثالث
  { roomNumber: '2023', floor: '3', department: 'البهو', type: 'معمل الإلكترونيات' },
  { roomNumber: '2035', floor: '3', department: 'البهو', type: 'معمل الأجهزة الرقمية' },
  { roomNumber: '2022', floor: '3', department: 'البهو', type: 'استراحة' },
  { roomNumber: '2020.B2', floor: '3', department: 'البهو', type: 'حمام سيدات' },
  { roomNumber: '2011', floor: '3', department: 'البهو', type: 'درج' },
  { roomNumber: '2008', floor: '3', department: 'البهو', type: 'غرفة طباعة' },
  { roomNumber: '2006', floor: '3', department: 'البهو', type: 'قاعة' },
  { roomNumber: '2004', floor: '3', department: 'البهو', type: 'قاعة' },
  { roomNumber: '2056', floor: '3', department: 'البهو', type: 'قاعة' },
  { roomNumber: '2054', floor: '3', department: 'البهو', type: 'معمل الروبوت' },

  //* وحدة شؤون الطلاب
  {
    roomNumber: 'G060',
    floor: '1',
    department: 'وحدة شؤون الطلاب',
    doctor: 'أ. خالد علوب',
    Demail: 'kmAloup@iau.edu.sa',
  },
  {
    roomNumber: 'G069',
    floor: '1',
    department: 'وحدة شؤون الطلاب',
    doctor: 'أ. مأمون عبدالقادر',
    Demail: 'mmibrahim@iau.edu.sa',
  },

  //* ادارة الكلية
];

// Mapping functions
function getDepartmentType(arabicName: string): DeptType {
  switch (arabicName) {
    case 'هندسة الحاسب الآلي':
      return DeptType.CEE;
    case 'علوم الحاسب':
      return DeptType.CSD;
    case 'نظم المعلومات الحاسوبية':
      return DeptType.CISD;
    case 'الشبكات والاتصالات':
      return DeptType.CNCO;
    case 'معمل 1':
      return DeptType.LABS1;
    case 'معمل 3':
      return DeptType.LABS3;
    case 'معمل 4':
      return DeptType.LABS4;
    case 'البهو':
      return DeptType.GENERAL;
    case 'وحدة شؤون الطلاب':
      return DeptType.STUDENT_AFFAIRS;
    case 'قاعات الطابق الثالث مقابل المصعد':
      return DeptType.GENERAL;
    default:
      return DeptType.ADMINISTRATION;
  }
}

function getLocationType(arabicType: string | undefined, hasDoctor: boolean): LocationType {
  if (hasDoctor) return LocationType.OFFICE;

  switch (arabicType) {
    case 'قاعة':
      return LocationType.CLASSROOM;
    case 'استراحة':
      return LocationType.MAIN_HALL;
    case 'مخرج':
      return LocationType.EXIT;
    case 'غرفة طباعة':
      return LocationType.SERVICE;
    case 'مصلى سيدات':
      return LocationType.PRAYER_ROOM;
    case 'مخزن':
      return LocationType.STORE_ROOM;
    case 'معمل حاسب':
      return LocationType.LAB;
    case 'نادي الأمن السيبراني':
      return LocationType.OFFICE;
    case 'مكتب اداري':
      return LocationType.OFFICE;
    case 'خزائن':
      return LocationType.LOCKERS;
    case 'درج':
      return LocationType.STAIRS;
    case 'المسرح الرئيسي':
      return LocationType.THEATER;
    case 'صالة كبار الشخصيات':
      return LocationType.CONFERENCE;
    case 'مسرح ١':
      return LocationType.THEATER;
    case 'غرفة نقاش':
      return LocationType.CONFERENCE;
    case 'دورة مياه طلاب':
      return LocationType.RESTROOM;
    case 'بهو انتظار':
      return LocationType.MAIN_HALL;
    case 'قاعة أختبارات يسار':
      return LocationType.CLASSROOM;
    case 'قاعة أختبارات يمين':
      return LocationType.CLASSROOM;
    case 'معمل الروبوت':
      return LocationType.LAB;
    case 'غرفة الشبكات':
      return LocationType.SERVER_ROOM;
    case 'معمل الإلكترونيات':
      return LocationType.LAB;
    case 'معمل الأجهزة الرقمية':
      return LocationType.LAB;
    case 'حمام سيدات':
      return LocationType.RESTROOM;
    case 'دورة مياه طالبات':
      return LocationType.RESTROOM;
    case 'غرفة':
      return LocationType.OFFICE;
    default:
      return LocationType.CLASSROOM; // Fallback
  }
}

async function main() {
  console.log('🌱 Starting database seed with real dataset...');

  // 1. Clean existing data
  await prisma.rssiReading.deleteMany();
  await prisma.beacon.deleteMany();
  await prisma.path.deleteMany();
  await prisma.officeHours.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.location.deleteMany();
  await prisma.department.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.building.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Building
  const building = await prisma.building.create({
    data: {
      name: 'CCSIT Building',
      code: 'CCSIT',
    },
  });

  // 3. Create Floors (1, 2, 3)
  const floor1 = await prisma.floor.create({
    data: { floor_number: 1, building_id: building.id, floor_plan_image_url: 'http://localhost:3000/map.svg' },
  });
  const floor2 = await prisma.floor.create({
    data: { floor_number: 2, building_id: building.id, floor_plan_image_url: 'http://localhost:3000/map.svg' },
  });
  const floor3 = await prisma.floor.create({
    data: { floor_number: 3, building_id: building.id, floor_plan_image_url: 'http://localhost:3000/map.svg' },
  });

  const floorMap = {
    '1': floor1.id,
    '2': floor2.id,
    '3': floor3.id,
  };

  // 4. Create Departments
  const deptData = [
    { name: 'Computer Engineering', type: DeptType.CEE },
    { name: 'Computer Science', type: DeptType.CSD },
    { name: 'Computer Information Systems', type: DeptType.CISD },
    { name: 'Network and Communications', type: DeptType.CNCO },
    { name: 'Computer Labs 1', type: DeptType.LABS1 },
    { name: 'Computer Labs 3', type: DeptType.LABS3 },
    { name: 'Student Labs 4', type: DeptType.LABS4 },
    { name: 'Main Lobby & Facilities', type: DeptType.GENERAL },
    { name: 'Student Affairs', type: DeptType.STUDENT_AFFAIRS },
    { name: 'Administration', type: DeptType.ADMINISTRATION },
  ];

  const deptMap = new Map<DeptType, number>();

  for (const d of deptData) {
    const dept = await prisma.department.create({
      data: { name: d.name, type: d.type },
    });
    deptMap.set(d.type, dept.id);
  }

  console.log('✅ Infrastructure created');

  // 5. Process Rooms
  for (const room of rawRooms) {
    const deptType = getDepartmentType(room.department);
    const deptId = deptMap.get(deptType);
    const floorId = floorMap[room.floor as keyof typeof floorMap];

    if (!floorId) {
      console.warn(`Skipping room ${room.roomNumber} - Invalid floor ${room.floor}`);
      continue;
    }

    const type = getLocationType(room.type, !!room.doctor);

    // Create Location
    // Since coordinates are unknown, we use dummy values or random scatter for visualization
    const location = await prisma.location.upsert({
      where: {
        floor_id_room_number: {
          floor_id: floorId,
          room_number: room.roomNumber,
        },
      },
      update: {},
      create: {
        name: room.type || `Office ${room.roomNumber}`,
        room_number: room.roomNumber,
        type: type,
        floor_id: floorId,
        department_id: deptId,
        coordinate_x: Math.random() * 1,
        coordinate_y: Math.random() * 1,
      },
    });

    // If it's a professor/doctor
    if (room.doctor) {
      // Create User
      // Handle missing email by generating a fake one from username or random
      let email = room.Demail;
      if (!email || email.trim() === '') {
        const safeName = room.doctor.replace(/\s+/g, '.').replace(/[^\w\s]/gi, ''); // rudimentary sanitization
        email = `user.${safeName}${Math.floor(Math.random() * 1000)}@iau.edu.sa`;
      }

      email = email.toLowerCase();
      const username = email.split('@')[0];
      const hashedPassword = await bcrypt.hash('12345678', 10);

      try {
        const user = await prisma.user.upsert({
          where: { email: email },
          update: {},
          create: {
            email: email,
            username: username,
            password_hash: hashedPassword,
            name: room.doctor,
            role: Role.FACULTY,
          },
        });

        // Create Professor Profile
        await prisma.professor.create({
          data: {
            full_name: room.doctor,
            email: email,
            user_id: user.id,
            location_id: location.id,
            department_id: deptId || 0, // Fallback if dept missing
          },
        });
      } catch (e) {
        console.error(`Failed to create user/professor for ${room.doctor} (${email})`, e);
        // Continue seeding other records
      }
    }
  }

  // Create an Admin user as well
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@iau.edu.sa' },
    update: {},
    create: {
      email: 'admin@iau.edu.sa',
      username: 'admin',
      password_hash: adminHash,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  //! Create an Security user as well
  const securityHash = await bcrypt.hash('security123', 10);
  const security = await prisma.user.upsert({
    where: { email: 'security@iau.edu.sa' },
    update: {},
    create: {
      email: 'security@iau.edu.sa',
      username: 'security',
      password_hash: securityHash,
      name: 'Security',
      role: Role.SECURITY,
    },
  });

  await prisma.security.upsert({
    where: { user_id: security.id },
    update: {},
    create: {
      user_id: security.id,
    },
  });

  //! Create an IT user as well
  const itHash = await bcrypt.hash('IT1234567', 10);
  const it = await prisma.user.upsert({
    where: { email: 'it@iau.edu.sa' },
    update: {},
    create: {
      email: 'it@iau.edu.sa',
      username: 'IT',
      password_hash: itHash,
      name: 'IT',
      role: Role.IT,
    },
  });

  await prisma.iT.upsert({
    where: { user_id: it.id },
    update: {},
    create: {
      user_id: it.id,
    },
  });

  console.log('✅ Locations & Users created');
  console.log('🎉 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
