import React, { useState, useEffect, useRef } from "react";
import { Project } from "../types";
import { apiFetch } from "../lib/apiFetch";
import mammoth from "mammoth";
import { 
  ArrowLeft, Download, FileText, CheckCircle2, AlertCircle, 
  Shield, Award, Upload, Check, Trash2, RefreshCw, FileCode, Lock, CheckCircle,
  Pencil, X, History, Eye, ChevronRight, Edit, Save
} from "lucide-react";

interface EditableSchemeFormProps {
  project: Project;
  onBack: () => void;
  onSaved?: () => void;
  onRegenerate?: () => void;
}

// ----------------------------------------------------------------------
// DATA STRUCTURES: Fudan University First Hospital Orthopedics follow-up dataset scheme
// ----------------------------------------------------------------------

export const DICOM_TAGS = [
  { tag: "(0008,0005)", name: "瀛楃闆?(Specific Character Set)", tech: "鍘熸枃", desc: "淇濈暀鍘熸枃" },
  { tag: "(0008,0008)", name: "鍥惧儚绫诲瀷 (Image Type)", tech: "鍘熸枃", desc: "淇濈暀鍘熸枃" },
  { tag: "(0008,0012)", name: "瀹炰緥鍒涘缓鏃ユ湡 (Instance Creation Date)", tech: "鎵板姩/鍋忕Щ", desc: "闅忚鏃ユ湡锛屽悜鍓?鍚庡亸绉荤壒瀹氬ぉ鏁帮紙涓嶈秴杩嚶?澶╋級锛屽悓涓€鎮ｈ€呮墍鏈夋棩鏈熷亸绉讳竴鑷? },
  { tag: "(0008,0013)", name: "瀹炰緥鍒涘缓鏃堕棿 (Instance Creation Time)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥?00000.00鈥? },
  { tag: "(0008,0016)", name: "SOP 绫?UID (SOP Class UID)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴" },
  { tag: "(0008,0018)", name: "SOP 瀹炰緥 UID (SOP Instance UID)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴" },
  { tag: "(0008,0020)", name: "妫€鏌ユ棩鏈?(Study Date)", tech: "鎵板姩/鍋忕Щ", desc: "闅忚鏃ユ湡锛屽悜鍚?鍓嶅亸绉荤浉鍚屽ぉ鏁帮紙涓嶈秴杩嚶?4澶╋級锛屽悓涓€鎮ｈ€呮墍鏈夋棩鏈熷亸绉讳竴鑷? },
  { tag: "(0008,0023)", name: "鍐呭鏃ユ湡 (Content Date)", tech: "鎵板姩/鍋忕Щ", desc: "鍙傝€冩鏌ユ棩鏈熷鐞嗘柟娉? },
  { tag: "(0008,002a)", name: "閲囬泦鏃ユ湡鏃堕棿 (Acquisition DateTime)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥?00000.00鈥? },
  { tag: "(0008,0030)", name: "妫€鏌ユ椂闂?(Study Time)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥?00000.00鈥? },
  { tag: "(0008,0033)", name: "鍐呭鏃堕棿 (Content Time)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥?00000.00鈥? },
  { tag: "(0008,0050)", name: "鐢宠缂栧彿 (Accession Number)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴" },
  { tag: "(0008,0060)", name: "妫€鏌ユā鎬?(Modality)", tech: "鍘熸枃", desc: "淇濈暀鍘熸枃" },
  { tag: "(0008,0070)", name: "璁惧鍘傚晢 (Manufacturer)", tech: "鍘熸枃", desc: "淇濈暀鍘熸枃" },
  { tag: "(0008,0080)", name: "鏈烘瀯鍚嶇О (Institution Name)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥淎NONYMIZED鈥? },
  { tag: "(0008,0090)", name: "杞瘖鍖荤敓濮撳悕 (Referring Physician's Name)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥淎NONYMIZED鈥? },
  { tag: "(0008,1010)", name: "璁惧绔欏悕绉?(Station Name)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥淎NONYMIZED鈥? },
  { tag: "(0008,103e)", name: "搴忓垪鎻忚堪 (Series Description)", tech: "鍘熸枃", desc: "淇濈暀鍘熸枃" },
  { tag: "(0008,1070)", name: "鎿嶄綔鍖荤敓濮撳悕 (Operators' Name)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥淎NONYMIZED鈥? },
  { tag: "(0010,0010)", name: "鎮ｈ€呭鍚?(Patient's Name)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥淎NONYMIZED鈥? },
  { tag: "(0010,0020)", name: "鎮ｈ€?ID (Patient ID)", tech: "鍋囧悕鍖?, desc: "鏇挎崲涓?32 浣嶅搱甯屽€硷紙SM3 鍔犵洂锛夛紝涓庣粨鏋勫寲琛ㄦ牸涓偅鑰呯紪鍙蜂繚鎸佷竴鑷? },
  { tag: "(0010,0030)", name: "鎮ｈ€呭嚭鐢熸棩鏈?(Patient's Birth Date)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥?0010101鈥? },
  { tag: "(0010,0040)", name: "鎮ｈ€呮€у埆 (Patient's Sex)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥淥鈥? },
  { tag: "(0018,1000)", name: "璁惧搴忓垪鍙?(Device Serial Number)", tech: "鍋囧悕鍖?, desc: "缁熶竴鏇存敼涓?鈥淎NONYMIZED鈥? },
  { tag: "(0018,1020)", name: "杞欢鐗堟湰 (Software Versions)", tech: "鍘熸枃", desc: "淇濈暀鍘熸枃" },
  { tag: "(0020,000d)", name: "妫€鏌?UID (Study Instance UID)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴" },
  { tag: "(0020,000e)", name: "搴忓垪 UID (Series Instance UID)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴锛岀浉鍚屽簭鍒楀浘鍍忎繚鎸佷竴鑷? },
  { tag: "(0020,0010)", name: "妫€鏌?ID (Study ID)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴" },
  { tag: "(0020,0011)", name: "搴忓垪鍙?(Series Number)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴" },
  { tag: "(0020,0200)", name: "鍚屾妗嗘灦 UID (Synchronization Frame of Reference UID)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴" },
  { tag: "(0020,0242)", name: "鎷兼帴婧?SOP 瀹炰緥 UID (Source Image Sequence)", tech: "鍋囧悕鍖?, desc: "鏍规嵁鏃堕棿鎴抽噸鏂扮敓鎴愶紝淇濇寔鍞竴" }
];

export const ANONYMIZATION_FIELDS = [
  // 鍩虹浜哄彛瀛︿笌鐥呭彶
  { id: 1, name: "鎮ｈ€呯紪鍙?, def: "鎮ｈ€呭敮涓€璇嗗埆鍙?, tech: "鍋囧悕鍖?, note: "鍘熷€肩粡SM3鍔犵洂鍝堝笇杞负32浣嶅敮涓€瀛楃涓诧紝淇濊瘉鍏跺敮涓€锛屼笖涓嶥ICOM/褰╃収涓璓atient ID涓€鑷淬€?, cat: "鍩虹浜哄彛瀛︿笌鐥呭彶" },
  { id: 2, name: "鎬у埆", def: "鐢枫€佸コ", tech: "鍘熸枃", note: "涓嶆秹鍙婂彲鏍囪瘑灞炴€э紝鐩存帴淇濈暀銆?, cat: "鍩虹浜哄彛瀛︿笌鐥呭彶" },
  { id: 3, name: "灏辫瘖骞撮緞", def: "鎮ｈ€呭湪灏辫瘖褰撴棩鐨勫懆宀佸勾榫?, tech: "娉涘寲", note: "浠?宀佷负涓€鍖洪棿娉涘寲灞曠ず锛堝15-19銆?0-24...锛?0鍛ㄥ瞾鍙婁互涓婄粺绉?0宀?锛夈€?, cat: "鍩虹浜哄彛瀛︿笌鐥呭彶" },
  { id: 4, name: "鑱屼笟", def: "鎮ｈ€呰亴涓氳儗鏅被鍨?, tech: "娉涘寲", note: "娉涘寲涓衡€滃湪鑱屼汉鍛樷€濄€佲€滈潪鍦ㄨ亴浜哄憳鈥濆拰鈥滃鐢熲€濄€?, cat: "鍩虹浜哄彛瀛︿笌鐥呭彶" },
  { id: 5, name: "鏂囧寲绋嬪害", def: "瀛﹀巻鑳屾櫙", tech: "娉涘寲", note: "浣庡鍘?鍒濅腑鍙婁互涓? / 涓瓑瀛﹀巻(楂樹腑鑷虫湰绉? / 楂樺鍘?纭曞＋鍙婁互涓? 娉涘寲褰掔被銆?, cat: "鍩虹浜哄彛瀛︿笌鐥呭彶" },
  { id: 6, name: "鍚哥儫鍙?, def: "鏄惁鏈夊惛鐑熶範鎯?, tech: "鍘熸枃", note: "鏄?鍚︿繚鐣?, cat: "鍩虹浜哄彛瀛︿笌鐥呭彶" },
  { id: 7, name: "楗厭鍙?, def: "鏄惁鏈夐ギ閰掍範鎯?, tech: "鍘熸枃", note: "鏄?鍚︿繚鐣?, cat: "鍩虹浜哄彛瀛︿笌鐥呭彶" },
  { id: 8, name: "鏄惁鍒濇不", def: "鏄惁棣栨鎺ュ彈鎶?VEGF 娌荤枟", tech: "鍘熸枃", note: "鏄?鍚︿繚鐣?, cat: "鍩虹浜哄彛瀛︿笌鐥呭彶" },

  // 鏃跺簭涓庝复搴婃棩鏈?  { id: 9, name: "鍙戠梾鏃堕棿", def: "鑷堪鐪奸儴鐥囩姸寮€濮嬬殑鏃堕棿", tech: "鎵板姩/鍋忕Щ", note: "XXXX骞碭X鏈圶X鏃ワ紝鍚戝墠鎴栧悜鍚庡亸绉荤壒瀹氬ぉ鏁帮紙涓嶈秴杩嚶?4澶╋級銆傚悓涓€鎮ｈ€呮墍鏈夋棩鏈熷亸绉婚噺瀹屽叏涓€鑷淬€?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 14, name: "鐧藉唴闅滆瘖鏂椂闂?宸︾溂", def: "宸︾溂鐧藉唴闅滅‘璇婃棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶锛堜笉瓒呰繃卤14澶╁亸绉伙級銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 16, name: "鐧藉唴闅滆瘖鏂椂闂?鍙崇溂", def: "鍙崇溂鐧藉唴闅滅‘璇婃棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶锛堜笉瓒呰繃卤14澶╁亸绉伙級銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 18, name: "闈掑厜鐪艰瘖鏂椂闂?宸︾溂", def: "宸︾溂闈掑厜鐪肩‘璇婃棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 19, name: "闈掑厜鐪兼不鐤楁椂闂?宸︾溂", def: "宸︾溂闈掑厜鐪兼帴鍙楁不鐤楁棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 21, name: "闈掑厜鐪艰瘖鏂椂闂?鍙崇溂", def: "鍙崇溂闈掑厜鐪肩‘璇婃棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 22, name: "闈掑厜鐪兼不鐤楁椂闂?鍙崇溂", def: "鍙崇溂闈掑厜鐪兼帴鍙楁不鐤楁棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 24, name: "绯栧翱鐥呰缃戣啘鐥呭彉宸︾溂-璇婃柇鏃堕棿", def: "宸︾溂绯栫綉纭瘖鏃ユ湡", tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 26, name: "绯栧翱鐥呰缃戣啘鐥呭彉鍙崇溂-璇婃柇鏃堕棿", def: "鍙崇溂绯栫綉纭瘖鏃ユ湡", tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 28, name: "鍏朵粬鐜荤拑浣撹缃戣啘鐤剧梾宸︾溂-璇婃柇鏃堕棿", def: "宸︾溂鍏跺畠鐪煎簳鐥呯‘璇婃棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 30, name: "鍏朵粬鐜荤拑浣撹缃戣啘鐤剧梾鍙崇溂-璇婃柇鏃堕棿", def: "鍙崇溂鍏跺畠鐪煎簳鐥呯‘璇婃棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 32, name: "澶栦激鍙插強鎵嬫湳鍙叉椂闂?宸︾溂", def: "宸︾溂澶栦激鍙婃墜鏈彂鐢熸棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },
  { id: 34, name: "澶栦激鍙插強鎵嬫湳鍙叉椂闂?鍙崇溂", def: "鍙崇溂澶栦激鍙婃墜鏈彂鐢熸棩鏈?, tech: "鎵板姩/鍋忕Щ", note: "鍙傝€冨彂鐥呮椂闂村瓧娈电殑澶勭悊鏂规硶銆?, cat: "鏃跺簭涓庝复搴婃棩鏈? },

  // 鐪肩鐥囩姸涓庣梾鍙?  { id: 10, name: "鑷鐥囩姸-宸︾溂", def: "宸︾溂鑷鐥囩姸琛ㄧ幇", tech: "鍘熸枃", note: "鐪煎墠榛戝奖椋樺姩/瑙嗗姏涓嬮檷/瑙嗙墿閬尅/椋炶殜鐥囩瓑锛屽師鏂囦繚鐣欍€?, cat: "鐪肩鐥囩姸涓庣梾鍙? },
  { id: 11, name: "鑷鐥囩姸-鍙崇溂", def: "鍙崇溂鑷鐥囩姸琛ㄧ幇", tech: "鍘熸枃", note: "鐪煎墠榛戝奖椋樺姩/瑙嗗姏涓嬮檷/瑙嗙墿閬尅/椋炶殜鐥囩瓑锛屽師鏂囦繚鐣欍€?, cat: "鐪肩鐥囩姸涓庣梾鍙? },
  { id: 12, name: "鐪肩鐥呭彶", def: "鏃㈠線鐪奸儴鐤剧梾鍙茬患鍚堣嚜杩?, tech: "鍘熸枃", note: "鏃犮€佹湁銆佷笉璇︼紝鍘熸枃淇濈暀銆?, cat: "鐪肩鐥囩姸涓庣梾鍙? },
  { id: 13, name: "鐧藉唴闅?宸︾溂", def: "宸︾溂鏄惁鎮ｆ湁鐧藉唴闅滃強鏈紡", tech: "鍘熸枃", note: "鐧藉唴闅滄不鐤椼€佹棤銆佹湁锛堣秴涔冲惛鍑恒€佷汉宸ユ櫠浣撴鍏ョ瓑锛?, cat: "鐪肩鐥囩姸涓庣梾鍙? },
  { id: 15, name: "鐧藉唴闅?鍙崇溂", def: "鍙崇溂鏄惁鎮ｆ湁鐧藉唴闅滃強鏈紡", tech: "鍘熸枃", note: "鐧藉唴闅滄不鐤椼€佹棤銆佹湁锛堣秴涔冲惛鍑恒€佷汉宸ユ櫠浣撴鍏ョ瓑锛?, cat: "鐪肩鐥囩姸涓庣梾鍙? },
  { id: 17, name: "闈掑厜鐪?宸︾溂", def: "宸︾溂闈掑厜鐪肩被鍨嬨€佺敤鑽強鎵嬫湳", tech: "鍘熸枃", note: "鑽墿娌荤枟/灏忔鍒囬櫎/鎴挎按寮曟祦闃€/鍛ㄨ竟铏硅啘鍒囧紑绛?, cat: "鐪肩鐥囩姸涓庣梾鍙? },
  { id: 20, name: "闈掑厜鐪?鍙崇溂", def: "鍙崇溂闈掑厜鐪肩被鍨嬨€佺敤鑽強鎵嬫湳", tech: "鍘熸枃", note: "鍚屽乏鐪兼弿杩帮紝鍘熸枃淇濈暀銆?, cat: "鐪肩鐥囩姸涓庣梾鍙? },

  // 鍏ㄨ韩鍚堝苟鐥?  { id: 39, name: "绯栧翱鐥?, def: "鏄惁鎮ｆ湁绯栧翱鐥呭強鎸佺画骞撮檺", tech: "鍘熸枃", note: "鍚︺€佹槸锛堟寔缁?XX 骞达級锛屼繚鐣欎綔涓轰复搴婂崗鍙橀噺銆?, cat: "鍏ㄨ韩鍚堝苟鐥? },
  { id: 40, name: "楂樿鍘?, def: "鏄惁鎮ｆ湁楂樿鍘嬪強鎸佺画骞撮檺", tech: "鍘熸枃", note: "鍚︺€佹槸锛堟寔缁?XX 骞达級锛屼繚鐣欎綔涓轰复搴婂崗鍙橀噺銆?, cat: "鍏ㄨ韩鍚堝苟鐥? },
  { id: 41, name: "楂樿鑴?, def: "鏄惁鎮ｆ湁楂樿鑴傚強鎸佺画骞撮檺", tech: "鍘熸枃", note: "鍚︺€佹槸锛堟寔缁?XX 骞达級锛屼繚鐣欎綔涓轰复搴婂崗鍙橀噺銆?, cat: "鍏ㄨ韩鍚堝苟鐥? },
  { id: 42, name: "鍐犲績鐥?, def: "鏄惁鎮ｆ湁鍐犲績鐥呭強鎸佺画骞撮檺", tech: "鍘熸枃", note: "鍚︺€佹槸锛堟寔缁?XX 骞达級锛屼繚鐣欎綔涓轰复搴婂崗鍙橀噺銆?, cat: "鍏ㄨ韩鍚堝苟鐥? },
  { id: 43, name: "鑴戞濉?, def: "鏄惁鎮ｆ湁鑴戞濉炲強鎸佺画骞撮檺", tech: "鍘熸枃", note: "鍚︺€佹槸锛堟寔缁?XX 骞达級锛屼繚鐣欎綔涓轰复搴婂崗鍙橀噺銆?, cat: "鑴戞濉? },
  { id: 44, name: "鎭舵€ц偪鐦?, def: "鏄惁鎮ｆ湁鎭舵€ц偪鐦ゅ強鎸佺画骞撮檺", tech: "鍘熸枃", note: "鍚︺€佹槸锛堟寔缁?XX 骞达級锛屼繚鐣欎綔涓轰复搴婂崗鍙橀噺銆?, cat: "鍏ㄨ韩鍚堝苟鐥? },
  { id: 63, name: "鏄惁浣跨敤鑳板矝绱?, def: "鎮ｈ€呰儼宀涚礌浣跨敤鎯呭喌", tech: "鍘熸枃", note: "鍚︺€佹槸锛堢洰鍓嶅凡鐢?XX 骞达級锛屼繚鐣欍€?, cat: "鍏ㄨ韩鍚堝苟鐥? },

  // 鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟
  { id: 45, name: "鏃㈠線鏄惁鐢ㄨ繃鎶?VEGF 娌荤枟-宸︾溂", def: "宸︾溂鏃㈠線鎶?VEGF 娌荤枟鍙?, tech: "鍘熸枃", note: "鏄€佸惁", cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },
  { id: 46, name: "鎶?VEGF 娌荤枟鐨勪骇鍝佺被鍨?宸︾溂", def: "宸︾溂鏃㈠線鎵€浣跨敤鐨勫叿浣撴姉 VEGF 鑽搧", tech: "鎵板姩", note: "楂橀绠楀瓙锛氶樋鏌忚タ鏅?2mg銆侀樋鏌忚タ鏅?8mg銆佸悍鏌忚タ鏅€佹硶鐟炶タ鍗曟姉銆侀浄鐝犲崟鎶楃瓑鎵撴暎鎵板姩銆?, cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },
  { id: 47, name: "鏃㈠線浣跨敤鎶?VEGF 娌荤枟鐨勬敞灏勯拡鏁?宸︾溂", def: "宸︾溂鏃㈠線绱娉ㄥ皠娆℃暟", tech: "鍘熸枃", note: "鏁板€间繚鐣?, cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },
  { id: 49, name: "鏃㈠線鏄惁鐢ㄨ繃鎶?VEGF 娌荤枟-鍙崇溂", def: "鍙崇溂鏃㈠線鎶?VEGF 娌荤枟鍙?, tech: "鍘熸枃", note: "鏄€佸惁", cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },
  { id: 50, name: "鎶?VEGF 娌荤枟鐨勪骇鍝佺被鍨?鍙崇溂", def: "鍙崇溂鏃㈠線浣跨敤鐨勫叿浣撹嵂鍝?, tech: "鎵板姩", note: "鍚屽乏鐪煎鐞嗭紝鎵ц娣锋穯绠楁硶銆?, cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },
  { id: 51, name: "鏃㈠線浣跨敤鎶?VEGF 娌荤枟鐨勬敞灏勯拡鏁?鍙崇溂", def: "鍙崇溂鏃㈠線绱娉ㄥ皠娆℃暟", tech: "鍘熸枃", note: "鏁板€间繚鐣?, cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },
  { id: 53, name: "鏃㈠線鏄惁浣跨敤杩囨縺绱犳不鐤?宸︾溂", def: "宸︾溂鏃㈠線婵€绱犺嵂鐗╂不鐤楀彶", tech: "鍘熸枃", note: "鏄€佸惁", cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },
  { id: 54, name: "鏃㈠線浣跨敤杩囧摢浜涙縺绱犳不鐤?宸︾溂", def: "宸︾溂鏃㈠線浣跨敤鐨勫叿浣撴縺绱犺嵂鍝?, tech: "鍘熸枃", note: "鍦板绫虫澗鐜荤拑浣撳唴妞嶅叆鍓?鍌茶开閫傜瓑锛屼繚鐣欍€?, cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },
  { id: 59, name: "鏃㈠線鏄惁鎺ュ彈杩囩幓鐠冧綋鍒囬櫎鏈?宸︾溂", def: "宸︾溂鏃㈠線鐜荤拑浣撳垏闄ゆ墜鏈彶", tech: "鍘熸枃", note: "鏄€佸惁", cat: "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟" },

  // 瑙嗗姏涓庣溂鍘嬫祴閲忓€?  { id: 64, name: "瑁哥溂瑙嗗姏-宸︾溂", def: "宸︾溂瑁哥溂瑙嗗姏妫€鏌ュ€?, tech: "鍘熸枃", note: "灏忔暟鎴栧鏁拌鍔涙暟鍊硷紝鐩存帴淇濈暀銆?, cat: "瑙嗗姏涓庣溂鍘嬫祴閲忓€? },
  { id: 65, name: "瑁哥溂瑙嗗姏-鍙崇溂", def: "鍙崇溂瑁哥溂瑙嗗姏妫€鏌ュ€?, tech: "鍘熸枃", note: "灏忔暟鎴栧鏁拌鍔涙暟鍊硷紝鐩存帴淇濈暀銆?, cat: "瑙嗗姏涓庣溂鍘嬫祴閲忓€? },
  { id: 67, name: "鏈€浣崇煫姝ｈ鍔涘乏鐪?, def: "宸︾溂鏈€浣崇煫姝ｈ鍔?(BCVA) 娴嬮噺鍊?, tech: "鍘熸枃", note: "闅忚鏍稿績瑙嗗姏鏁版嵁锛岀洿鎺ヤ繚鐣欍€?, cat: "瑙嗗姏涓庣溂鍘嬫祴閲忓€? },
  { id: 68, name: "鏈€浣崇煫姝ｈ鍔涘彸鐪?, def: "鍙崇溂鏈€浣崇煫姝ｈ鍔?(BCVA) 娴嬮噺鍊?, tech: "鍘熸枃", note: "闅忚鏍稿績瑙嗗姏鏁版嵁锛岀洿鎺ヤ繚鐣欍€?, cat: "瑙嗗姏涓庣溂鍘嬫祴閲忓€? },
  { id: 70, name: "鐪煎帇-宸︾溂", def: "宸︾溂鐪煎帇鎺掓煡鎯呭喌", tech: "鍘熸枃", note: "宸叉煡/鏈煡", cat: "瑙嗗姏涓庣溂鍘嬫祴閲忓€? },
  { id: 72, name: "鐪煎帇鍊?宸︾溂", def: "宸︾溂鍏蜂綋鐪煎帇鏁板€?, tech: "鍘熸枃", note: "鍗曚綅 mmHg 涓村簥鏁板€硷紝鐩存帴淇濈暀銆?, cat: "瑙嗗姏涓庣溂鍘嬫祴閲忓€? },

  // 绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇
  { id: 75, name: "绯栧翱鐥呰缃戣啘鐥呭彉宸︾溂 (绯栫綉)", def: "宸︾溂绯栧翱鐥呯綉鑶滅梾鍙樿瘖鏂?, tech: "鍘熸枃", note: "鏈?鏃狅紝涓村簥鍏抽敭鎸囨爣銆?, cat: "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇" },
  { id: 77, name: "绯栧翱鐥呰缃戣啘鐥呭彉鍒嗘湡宸︾溂", def: "宸︾溂绯栧翱鐥呯綉鑶滅梾鍙樺叿浣撳垎鏈?, tech: "鍘熸枃", note: "NPDR I-III鏈熴€丳DR鏈燂紝鐩存帴淇濈暀銆?, cat: "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇" },
  { id: 81, name: "瑙嗙綉鑶滈潤鑴夐樆濉炲乏鐪?, def: "宸︾溂鏄惁鎮ｆ湁瑙嗙綉鑶滈潤鑴夐樆濉?, tech: "鍘熸枃", note: "鏈?鏃狅紝鐩存帴淇濈暀銆?, cat: "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇" },
  { id: 83, name: "瑙嗙綉鑶滈潤鑴夐樆濉炴弿杩板乏鐪?, def: "宸︾溂闈欒剦闃诲鍏蜂綋鎻忚堪", tech: "鍘熸枃", note: "瑙嗙綉鑶滀腑澶潤鑴夐樆濉?鍒嗘敮闈欒剦闃诲", cat: "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇" },
  { id: 87, name: "骞撮緞鐩稿叧鎬ч粍鏂戝彉鎬у乏鐪?, def: "宸︾溂鏄惁鎮ｆ湁鑰佸勾鎬ч粍鏂戝彉鎬?, tech: "鍘熸枃", note: "鏈?鏃?, cat: "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇" },
  { id: 89, name: "骞撮緞鐩稿叧鎬ч粍鏂戝彉鎬ф弿杩板乏鐪?, def: "宸︾溂榛勬枒鍙樻€т复搴婂垎鍨?, tech: "鍘熸枃", note: "骞叉€с€佹箍鎬?, cat: "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇" },
  { id: 93, name: "绯栧翱鐥呮€ч粍鏂戞按鑲?宸︾溂", def: "宸︾溂鏄惁鎮ｆ湁榛勬枒姘磋偪 (DME)", tech: "鍘熸枃", note: "鏈?鏃?, cat: "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇" },
  { id: 97, name: "鐜荤拑浣撴敞鑽湳鐢ㄨ嵂鎯呭喌left", def: "宸︾溂娌荤枟鎵€浣跨敤鐨勫叿浣撴姉 VEGF 鑽搧", tech: "鍘熸枃", note: "鏍稿績绉戠爺鐢ㄨ嵂瀛楁锛岀洿鎺ヤ繚鐣欍€?, cat: "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇" },

  // 鏈悗鎯呭喌涓庡苟鍙戠棁
  { id: 101, name: "鐜荤拑浣撴贩娴?, def: "闅忚鏈熼棿鏄惁瀛樺湪鐜荤拑浣撴贩娴?, tech: "鍘熸枃", note: "鏈夈€佹棤锛屽師鏂囦繚鐣欍€?, cat: "鏈悗鎯呭喌涓庡苟鍙戠棁" },
  { id: 102, name: "鍓嶆埧闂緣", def: "闅忚鏈熼棿鏄惁瀛樺湪鍓嶆埧闂緣", tech: "鍘熸枃", note: "鏈夈€佹棤锛屽師鏂囦繚鐣欍€?, cat: "鏈悗鎯呭喌涓庡苟鍙戠棁" },
  { id: 103, name: "鐪煎唴鐐?, def: "娉ㄨ嵂鏈悗鎴栬嚜鍙戞€х溂鍐呮劅鏌?, tech: "鍘熸枃", note: "鏈夈€佹棤锛岀綍瑙佸畨鍏ㄤ簨浠讹紝淇濈暀銆?, cat: "鏈悗鎯呭喌涓庡苟鍙戠棁" },
  { id: 104, name: "瑙嗙綉鑶滆绠＄値", def: "鏄惁鎮ｆ湁瑙嗙綉鑶滆绠＄値", tech: "鍘熸枃", note: "鏈夈€佹棤锛屼繚鐣欍€?, cat: "鏈悗鎯呭喌涓庡苟鍙戠棁" },
  { id: 106, name: "RPE 鎾曡", def: "瑙嗙綉鑶滆壊绱犱笂鐨眰 (RPE) 鏄惁鎾曡", tech: "鍘熸枃", note: "鏈夈€佹棤锛屽畨鍏ㄨ瘎浼版寚鏍囥€?, cat: "鏈悗鎯呭喌涓庡苟鍙戠棁" },
  { id: 107, name: "鏈腑鏄惁浣跨敤纭呮补", def: "鐜荤拑浣撴墜鏈腑鏄惁濉厖纭呮补", tech: "鍘熸枃", note: "鏈?鏃?鍏蜂綋涓嶈锛屼繚鐣欍€?, cat: "鏈悗鎯呭喌涓庡苟鍙戠棁" },
  { id: 111, name: "鏈悗涓€鏈堟槸鍚﹀彂鐢熺幓鐠冧綋绉", def: "鏈悗 1 涓湀闅忚鐜昏鎯呭喌", tech: "鍘熸枃", note: "鏈?鏃?涓嶈锛屼繚鐣欍€?, cat: "鏈悗鎯呭喌涓庡苟鍙戠棁" }
];

// ----------------------------------------------------------------------
// COMPONENT: EditableText
// ----------------------------------------------------------------------

interface EditableTextProps {
  value?: string;
  onChange: (newValue: string) => void;
  readOnly?: boolean;
}

function EditableText({ value = "", onChange, readOnly }: EditableTextProps) {
  if (!readOnly) {
    return (
      <div className="space-y-2 mt-2 bg-slate-50 p-3 rounded-lg border border-blue-400">
        <textarea
          className="w-full p-2.5 text-xs md:text-sm text-slate-800 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium leading-relaxed"
          rows={Math.max(4, (value || "").split('\n').length)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  const lines = (value || "").split('\n');

  return (
    <div className="mt-2">
      <div className="text-slate-600 leading-relaxed text-xs md:text-sm whitespace-pre-wrap text-justify">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('鈥?) || trimmed.startsWith('-')) {
            const cleanText = trimmed.replace(/^[鈥-]\s*/, '');
            return (
              <div key={idx} className="flex items-start space-x-1.5 pl-4 py-0.5">
                <span className="text-blue-500 font-bold mt-1 select-none">鈥?/span>
                <span className="flex-1 text-slate-600 leading-relaxed text-xs md:text-sm">{cleanText}</span>
              </div>
            );
          }
          if (/^\d+\.\s*/.test(trimmed)) {
            return (
              <div key={idx} className="pl-4 py-0.5 text-slate-600 leading-relaxed text-xs md:text-sm font-semibold">
                {line}
              </div>
            );
          }
          return (
            <p key={idx} className="mt-2 first:mt-0 text-slate-600 leading-relaxed text-xs md:text-sm">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENT: DefaultRequirementLayout
// ----------------------------------------------------------------------

interface DefaultRequirementLayoutProps {
  schemeTexts: any;
  onChangeText: (key: string, value: string) => void;
  readOnly?: boolean;
  projectName?: string;
  isGlobalEditing: boolean;
  
  techMeasures: any[];
  setTechMeasures: React.Dispatch<React.SetStateAction<any[]>>;
  mgmtMeasures: any[];
  setMgmtMeasures: React.Dispatch<React.SetStateAction<any[]>>;
  
  dataComposition: any[];
  setDataComposition: React.Dispatch<React.SetStateAction<any[]>>;
  dataAttributeSplittingData: any[];
  
  hospitalization711Fields: any[];
  examination712Fields: any[];
  abdominal721Fields: any[];
  thoracic722Fields: any[];
  minimizedFields: any[];
  
  appendixHospitalization: any[];
  setAppendixHospitalization: React.Dispatch<React.SetStateAction<any[]>>;
  appendixExamination: any[];
  setAppendixExamination: React.Dispatch<React.SetStateAction<any[]>>;
  appendixThoracic: any[];
  setAppendixThoracic: React.Dispatch<React.SetStateAction<any[]>>;
  appendixAbdominal: any[];
  setAppendixAbdominal: React.Dispatch<React.SetStateAction<any[]>>;
}

function DefaultRequirementLayout({ 
  schemeTexts, 
  onChangeText, 
  readOnly, 
  projectName,
  isGlobalEditing,
  techMeasures,
  setTechMeasures,
  mgmtMeasures,
  setMgmtMeasures,
  dataComposition,
  setDataComposition,
  dataAttributeSplittingData,
  hospitalization711Fields,
  examination712Fields,
  abdominal721Fields,
  thoracic722Fields,
  minimizedFields,
  appendixHospitalization,
  setAppendixHospitalization,
  appendixExamination,
  setAppendixExamination,
  appendixThoracic,
  setAppendixThoracic,
  appendixAbdominal,
  setAppendixAbdominal
}: DefaultRequirementLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("鍏ㄩ儴");

  const [appendixSearchQuery, setAppendixSearchQuery] = useState("");
  const [activeAppendixSearch, setActiveAppendixSearch] = useState("");

  const handleUpdateTechMeasure = (measure: string, status: string) => {
    setTechMeasures(prev => prev.map(item => 
      item.measure === measure ? { ...item, status } : item
    ));
  };

  const handleUpdateMgmtMeasure = (subject: string, measure: string, status: string) => {
    setMgmtMeasures(prev => prev.map(item => 
      item.subject === subject && item.measure === measure ? { ...item, status } : item
    ));
  };

  const handleUpdateDataComposition = (category: string, content: string) => {
    setDataComposition(prev => prev.map(item => 
      item.category === category ? { ...item, content } : item
    ));
  };

  const handleUpdateAppendixHospitalization = (field: string, key: string, value: string) => {
    setAppendixHospitalization(prev => prev.map(item => 
      item.field === field ? { ...item, [key]: value } : item
    ));
  };

  const handleUpdateAppendixExamination = (field: string, key: string, value: string) => {
    setAppendixExamination(prev => prev.map(item => 
      item.field === field ? { ...item, [key]: value } : item
    ));
  };

  const handleUpdateAppendixThoracic = (fieldOrTag: string, key: string, value: string) => {
    setAppendixThoracic(prev => prev.map(item => 
      (item.field === fieldOrTag || item.tag === fieldOrTag) ? { ...item, [key]: value } : item
    ));
  };

  const handleUpdateAppendixAbdominal = (fieldOrTag: string, key: string, value: string) => {
    setAppendixAbdominal(prev => prev.map(item => 
      (item.field === fieldOrTag || item.tag === fieldOrTag) ? { ...item, [key]: value } : item
    ));
  };

  const getFilteredAppendixData = (dataArray: any[], isImage: boolean) => {
    if (!activeAppendixSearch) return dataArray;
    const query = activeAppendixSearch.trim().toLowerCase();
    return dataArray.filter(item => {
      if (isImage) {
        return (
          (item.tag && item.tag.toLowerCase().includes(query)) ||
          (item.field && item.field.toLowerCase().includes(query)) ||
          (item.attr && item.attr.toLowerCase().includes(query)) ||
          (item.tech && item.tech.toLowerCase().includes(query)) ||
          (item.note && item.note.toLowerCase().includes(query))
        );
      } else {
        return (
          (item.field && item.field.toLowerCase().includes(query)) ||
          (item.tag && item.tag.toLowerCase().includes(query)) ||
          (item.attr && item.attr.toLowerCase().includes(query)) ||
          (item.tech && item.tech.toLowerCase().includes(query)) ||
          (item.note && item.note.toLowerCase().includes(query))
        );
      }
    });
  };

  const dicomExcelInputRef = useRef<HTMLInputElement>(null);
  const [dicomUploading, setDicomUploading] = useState(false);
  const [dicomFileName, setDicomFileName] = useState<string | null>(null);

  const fieldsExcelInputRef = useRef<HTMLInputElement>(null);
  const [fieldsUploading, setFieldsUploading] = useState(false);
  const [fieldsFileName, setFieldsFileName] = useState<string | null>(null);

  const handleDownloadDicomExcel = () => {
    const headers = ["Tag 缂栫爜", "Tag 璇箟", "澶勭悊鏂规硶", "璇︾粏缁嗚妭"];
    const rows = DICOM_TAGS.map(tag => [tag.tag, tag.name, tag.tech, tag.desc]);
    
    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DICOM_褰卞儚鍖垮悕鍖栬鍒欒〃_${projectName || '椤圭洰'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadDicomExcel = () => {
    dicomExcelInputRef.current?.click();
  };

  const onDicomExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDicomUploading(true);
      setDicomFileName(file.name);
      setTimeout(() => {
        setDicomUploading(false);
        window.alert(`馃帀 鎴愬姛瀵煎叆骞舵洿鏂?DICOM 褰卞儚鍖垮悕鍖栬〃鏍? ${file.name}锛乣);
      }, 1000);
    }
  };

  const handleDownloadFieldsExcel = () => {
    const headers = ["搴忓彿", "瀛楁鍚嶇О", "瀛楁瀹氫箟", "鑴辨晱鎶€鏈?, "绠楁硶瑙勫垯鍙婂疄鏂界粏鑺?, "鍒嗙被"];
    const rows = ANONYMIZATION_FIELDS.map((field, idx) => [
      idx + 1,
      field.name,
      field.def,
      field.tech,
      field.note,
      field.cat
    ]);
    const csvContent = "\ufeff" + [headers.join(","), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `缁撴瀯鍖栨枃鏈暟鎹瓧娈靛強鍖垮悕鍖栨妧鏈垪琛╛${projectName || '椤圭洰'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadFieldsExcel = () => {
    fieldsExcelInputRef.current?.click();
  };

  const onFieldsExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldsUploading(true);
      setFieldsFileName(file.name);
      setTimeout(() => {
        setFieldsUploading(false);
        window.alert(`馃帀 鎴愬姛瀵煎叆骞舵洿鏂扮粨鏋勫寲鏂囨湰鏁版嵁瀛楁鍙婂尶鍚嶅寲鎶€鏈垪琛? ${file.name}锛乣);
      }, 1000);
    }
  };

  const categories = [
    "鍏ㄩ儴",
    "鍩虹浜哄彛瀛︿笌鐥呭彶",
    "鏃跺簭涓庝复搴婃棩鏈?,
    "鐪肩鐥囩姸涓庣梾鍙?,
    "鍏ㄨ韩鍚堝苟鐥?,
    "鏃㈠線鎶梀EGF/婵€绱?鐜诲垏娌荤枟",
    "瑙嗗姏涓庣溂鍘嬫祴閲忓€?,
    "绯栧翱鐥呯綉鑶?榛勬枒/闈欒剦闃诲璇婃柇",
    "鏈悗鎯呭喌涓庡苟鍙戠棁"
  ];

  const filteredFields = ANONYMIZATION_FIELDS.filter(f => {
    const matchesCategory = selectedCategory === "鍏ㄩ儴" || f.cat === selectedCategory;
    const matchesSearch = 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.def.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.tech.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.note.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 text-slate-700 text-xs md:text-sm text-justify font-medium" id="default_requirement_handcrafted_layout">
      {/* Chapters */}
      <div className="space-y-6">
        <div id="sec_principles" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>1. 鍖垮悕鍖栧師鍒?/span>
          </h3>
          <EditableText value={schemeTexts.sec1} onChange={(val) => onChangeText("sec1", val)} readOnly={readOnly} />
        </div>

        <div id="sec_norms" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>2. 鍙傝€冭鑼?/span>
          </h3>
          <EditableText value={schemeTexts.sec2} onChange={(val) => onChangeText("sec2", val)} readOnly={readOnly} />
        </div>

        <div id="sec_scenarios" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>3. 浣跨敤鍦烘櫙璇存槑</span>
          </h3>
          <EditableText value={schemeTexts.sec3} onChange={(val) => onChangeText("sec3", val)} readOnly={readOnly} />
        </div>

        <div id="sec_requirements" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>4. 闇€姹傚垎鏋?/span>
          </h3>
          <div className="space-y-4 mt-3">
            <div id="sec_4_1" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-2">4.1 鏁版嵁浣跨敤闇€姹傚垎鏋?/h4>
              <EditableText value={schemeTexts.sec4_1 || schemeTexts.sec4 || defaultSchemeTexts.sec4_1} onChange={(val) => onChangeText("sec4_1", val)} readOnly={readOnly} />
            </div>

            <div id="sec_4_2" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-2">4.2 娴侀€氬満鏅垎鏋?/h4>
              <EditableText value={schemeTexts.sec4_2 || defaultSchemeTexts.sec4_2} onChange={(val) => onChangeText("sec4_2", val)} readOnly={readOnly} />
            </div>

            <div id="sec_4_3" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs">4.3 娴侀€氱幆澧冨垎鏋?/h4>
              
              <div id="sec_4_3_1" className="scroll-mt-6">
                <h5 className="font-bold text-slate-800 text-[11px] mb-2">4.3.1 鎶€鏈繚闅滆兘鍔?/h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">鎶€鏈帾鏂?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍏峰鎯呭喌</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {techMeasures.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-800">{item.measure}</td>
                          <td className="p-2 text-center">
                            {!readOnly ? (
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateTechMeasure(item.measure, e.target.value)}
                                className="bg-white border border-slate-300 rounded text-[11px] font-bold px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                              >
                                <option value="婊¤冻">婊¤冻</option>
                                <option value="寰呭畬鍠?>寰呭畬鍠?/option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === "婊¤冻" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}>
                                {item.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="sec_4_3_2" className="scroll-mt-6">
                <h5 className="font-bold text-slate-800 text-[11px] mb-2">4.3.2 绠＄悊淇濋殰鑳藉姏</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-32 border-b border-slate-200 bg-slate-100">绠＄悊涓讳綋</th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">鎶€鏈帾鏂?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍏峰鎯呭喌</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {mgmtMeasures.map((item, idx) => {
                        const isFirstInGroup = idx === 0 || mgmtMeasures[idx - 1].subject !== item.subject;
                        let groupCount = 1;
                        if (isFirstInGroup) {
                          for (let i = idx + 1; i < mgmtMeasures.length; i++) {
                            if (mgmtMeasures[i].subject === item.subject) groupCount++;
                            else break;
                          }
                        }
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            {isFirstInGroup && (
                              <td rowSpan={groupCount} className="p-2 text-slate-800 font-bold bg-slate-50/30 align-top border-r border-slate-200">
                                {item.subject}
                              </td>
                            )}
                            <td className="p-2 text-slate-800">{item.measure}</td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.status}
                                  onChange={(e) => handleUpdateMgmtMeasure(item.subject, item.measure, e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  <option value="婊¤冻">婊¤冻</option>
                                  <option value="寰呭畬鍠?>寰呭畬鍠?/option>
                                </select>
                              ) : (
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.status === "婊¤冻" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}>
                                  {item.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="sec_scope" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>5. 鏁版嵁鑼冨洿</span>
          </h3>
          <div className="space-y-4 mt-3">
            {/* 5.1 鏁版嵁鏋勬垚 */}
            <div id="sec_5_1" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-2">5.1 鏁版嵁鏋勬垚</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-[11px] border-collapse bg-white">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 text-left w-32 border-b border-slate-200 bg-slate-100">鏁版嵁绫诲埆</th>
                      <th className="p-2 text-left border-b border-slate-200 bg-slate-100">鏁版嵁鍐呭</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dataComposition.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 text-slate-800 font-bold bg-slate-50/30">{item.category}</td>
                        <td className="p-2 text-slate-800">
                          {!readOnly ? (
                            <input
                              type="text"
                              value={item.content}
                              onChange={(e) => handleUpdateDataComposition(item.category, e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                            />
                          ) : (
                            item.content
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5.2 鏁版嵁灞炴€у垎绫?*/}
            <div id="sec_5_2" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-2">5.2 鏁版嵁灞炴€у垎绫?/h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-[11px] border-collapse bg-white">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 text-left w-28 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                      <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">鏁版嵁鍒嗙被</th>
                      <th className="p-2 text-left border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                      <th className="p-2 text-center w-24 border-b border-slate-200 bg-slate-100">鏁版嵁鏍囩</th>
                      <th className="p-2 text-left w-52 border-b border-slate-200 bg-slate-100">澶勭悊蹇呰鎬?/th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dataAttributeSplittingData.map((item, idx) => {
                      const isFirstGroup = idx === 0 || (
                        dataAttributeSplittingData[idx - 1].attr !== item.attr || 
                        dataAttributeSplittingData[idx - 1].necessity !== item.necessity
                      );
                      let groupCount = 1;
                      if (isFirstGroup) {
                        for (let i = idx + 1; i < dataAttributeSplittingData.length; i++) {
                          if (
                            dataAttributeSplittingData[i].attr === item.attr && 
                            dataAttributeSplittingData[i].necessity === item.necessity
                          ) {
                            groupCount++;
                          } else {
                            break;
                          }
                        }
                      }
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          {isFirstGroup && (
                            <td rowSpan={groupCount} className="p-2 text-slate-800 font-bold bg-slate-50/30 align-top border-r border-slate-200">
                              {item.attr}
                            </td>
                          )}
                          <td className="p-2 text-slate-800 border-r border-slate-100">{item.category}</td>
                          <td className="p-2 text-slate-800 border-r border-slate-100">{item.field}</td>
                          <td className="p-2 text-center text-slate-600 border-r border-slate-100">{item.tag}</td>
                          {isFirstGroup && (
                            <td rowSpan={groupCount} className="p-2 text-slate-700 align-top border-l border-slate-200">
                              {item.necessity}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div id="sec_targets" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>6. 澶勭悊鐩爣</span>
          </h3>
          <EditableText value={schemeTexts.sec6} onChange={(val) => onChangeText("sec6", val)} readOnly={readOnly} />
        </div>

        <div id="sec_anonym_tech" className="scroll-mt-6">
          <h3 className="font-black text-slate-900 border-b-2 border-slate-100 pb-2 text-sm tracking-tight flex items-center space-x-1.5">
            <span>7. 鍖垮悕鍖栧鐞嗘妧鏈?/span>
          </h3>
          <div className="space-y-4 mt-3">
            <div id="sec_text_anonym" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6 space-y-4">
              <div>
                <h4 className="font-bold text-slate-900">7.1 缁撴瀯鍖栨枃鏈暟鎹?/h4>
                <div className="mt-1">
                  <EditableText value={schemeTexts.sec7_1} onChange={(val) => onChangeText("sec7_1", val)} readOnly={true} />
                </div>
              </div>

              {/* 7.1.1 浣忛櫌淇℃伅 */}
              <div id="sec_7_1_1" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-xs mb-2">7.1.1 浣忛櫌淇℃伅</h5>
                <p className="text-slate-600 text-[11px] mb-3 leading-relaxed whitespace-pre-wrap">
                  娑夊強浣跨敤鐨勬柟娉曞寘鎷細
                  灞炴€у垹闄わ細濡傝褰曞唴瀹逛腑鐨勬偅鑰呭鍚嶃€佸尰鐢熷鍚嶇瓑锛?                  鍋囧悕鍖栵細濡傛偅鑰呮爣璇嗗彿銆佸氨璇婂彿锛?                  娉涘寲锛氬璁板綍鍐呭涓殑骞撮緞绛夛紱
                  鎵板姩锛氬灏辫瘖鏃堕棿绛夈€備互涓嬪垪涓鹃儴鍒嗙粨鏋勫寲鏂囨湰鏁版嵁瀛楁鐨勫尶鍚嶅寲鎶€鏈柟娉曪細
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁鏍囩</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍖垮悕鍖栨妧鏈?/th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">璇存槑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {hospitalization711Fields.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                          <td className="p-2 text-slate-700">{item.tag}</td>
                          <td className="p-2 text-slate-700">{item.attr}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.tech.includes("鍒犻櫎") ? "bg-red-50 text-red-700 border border-red-200" :
                              item.tech.includes("鍋囧悕") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                              item.tech.includes("娉涘寲") ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {item.tech}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 whitespace-pre-wrap leading-normal">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7.1.2 妫€鏌ヤ俊鎭?*/}
              <div id="sec_7_1_2" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-xs mb-2">7.1.2 妫€鏌ヤ俊鎭?/h5>
                <p className="text-slate-600 text-[11px] mb-3 leading-relaxed whitespace-pre-wrap">
                  娑夊強浣跨敤鐨勬柟娉曞寘鎷細
                  鍋囧悕鍖栵細濡傛偅鑰呮爣璇嗗彿銆佸氨璇婂彿锛?                  鎵板姩锛氬璁板綍鏃堕棿绛夈€備互涓嬪垪涓鹃儴鍒嗙粨鏋勫寲鏂囨湰鏁版嵁瀛楁鐨勫尶鍚嶅寲鎶€鏈柟娉曪細
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁鏍囩</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍖垮悕鍖栨妧鏈?/th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">璇存槑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {examination712Fields.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                          <td className="p-2 text-slate-700">{item.tag}</td>
                          <td className="p-2 text-slate-700">{item.attr}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.tech.includes("鍒犻櫎") ? "bg-red-50 text-red-700 border border-red-200" :
                              item.tech.includes("鍋囧悕") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                              item.tech.includes("娉涘寲") ? "bg-blue-50 text-blue-700 border border-blue-200" :
                              "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {item.tech}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 whitespace-pre-wrap leading-normal">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div id="sec_dicom_anonym" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6 space-y-4">
              <div className="border-b border-slate-200 pb-2.5 mb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="font-bold text-slate-900">7.2 褰卞儚鏁版嵁</h4>
              </div>

              <div>
                <EditableText value={schemeTexts.sec7_2} onChange={(val) => onChangeText("sec7_2", val)} readOnly={true} />
              </div>
              
              {dicomFileName && (
                <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex items-center justify-between">
                  <span>馃搫 褰撳墠宸插簲鐢ㄦ洿鏂拌〃鏍? <strong>{dicomFileName}</strong></span>
                  <button onClick={() => setDicomFileName(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 7.2.1 鑵归儴 */}
              <div id="sec_7_2_1" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-xs mb-2">7.2.1 鑵归儴</h5>
                <p className="text-slate-600 text-[11px] mb-3 leading-relaxed whitespace-pre-wrap">
                  娑夊強浣跨敤鐨勬柟娉曞寘鎷細
                  灞炴€у垹闄わ細濡侷mplementation Class UID銆両mplementation Version Name绛夛紱
                  鍋囧悕鍖栵細濡侻edia Storage SOP Class UID銆丮edia Storage SOP Instance UID銆丼OP Instance UID绛夈€備互涓嬪垪涓綝ICOM鏁版嵁鏍囩鍖垮悕鍖栨妧鏈柟娉曪細
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">TAG</th>
                        <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍖垮悕鍖栨妧鏈?/th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">璇存槑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {abdominal721Fields.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-900 font-mono font-bold">{item.tag}</td>
                          <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                          <td className="p-2 text-slate-700">{item.attr}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.tech.includes("鍒犻櫎") ? "bg-red-50 text-red-700 border border-red-200" :
                              item.tech.includes("鍋囧悕") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                              item.tech.includes("鎵板姩") ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {item.tech}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 whitespace-pre-wrap leading-normal">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7.2.2 鑳搁儴 */}
              <div id="sec_7_2_2" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-xs mb-2">7.2.2 鑳搁儴</h5>
                <p className="text-slate-600 text-[11px] mb-3 leading-relaxed whitespace-pre-wrap">
                  娑夊強浣跨敤鐨勬柟娉曞寘鎷細
                  灞炴€у垹闄わ細濡係ource Application Entity Title绛夛紱
                  鍋囧悕鍖栵細濡侻edia Storage SOP Class UID銆丮edia Storage SOP Instance UID銆丼OP Instance UID绛夛紱
                  鎵板姩锛氬Study Date銆備互涓嬪垪涓綝ICOM鏁版嵁鏍囩鍖垮悕鍖栨妧鏈柟娉曪細
                </p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">TAG</th>
                        <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍖垮悕鍖栨妧鏈?/th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">璇存槑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {thoracic722Fields.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 text-slate-900 font-mono font-bold">{item.tag}</td>
                          <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                          <td className="p-2 text-slate-700">{item.attr}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.tech.includes("鍒犻櫎") ? "bg-red-50 text-red-700 border border-red-200" :
                              item.tech.includes("鍋囧悕") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                              item.tech.includes("鎵板姩") ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {item.tech}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 whitespace-pre-wrap leading-normal">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div id="sec_img_anonym" className="bg-slate-50 rounded-lg p-4 border border-slate-200 scroll-mt-6">
              <h4 className="font-bold text-slate-900">7.3 鍥惧儚鏁版嵁</h4>
              <EditableText value={schemeTexts.sec7_3} onChange={(val) => onChangeText("sec7_3", val)} readOnly={readOnly} />
            </div>

            <div id="sec_special_anonym" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 scroll-mt-6">
              <h4 className="font-bold text-slate-900">7.4 鐗规畩鍖垮悕鍖栬鏄?/h4>
              <div className="space-y-2.5 text-xs text-slate-600 pl-2">
                <div id="sec_7_4_1" className="scroll-mt-6">
                  <strong className="text-slate-800 block">7.4.1 缁撴瀯鍖栨枃鏈笌DICOM褰卞儚鍏宠仈璇存槑</strong>
                  <EditableText value={schemeTexts.sec7_4_1} onChange={(val) => onChangeText("sec7_4_1", val)} readOnly={readOnly} />
                </div>
                <div id="sec_7_4_2" className="scroll-mt-6">
                  <strong className="text-slate-800 block">7.4.2 鎺掗櫎鈥滃墏閲忛〉搴忓垪鈥濆奖鍍忔枃浠?/strong>
                  <EditableText value={schemeTexts.sec7_4_2} onChange={(val) => onChangeText("sec7_4_2", val)} readOnly={readOnly} />
                </div>
                <div id="sec_7_4_3" className="scroll-mt-6">
                  <strong className="text-slate-800 block">7.4.3 鍖垮悕鍖栧奖鍍忎竴鑷存€ф牎楠?/strong>
                  <EditableText value={schemeTexts.sec7_4_4} onChange={(val) => onChangeText("sec7_4_4", val)} readOnly={readOnly} />
                </div>
              </div>
            </div>

            <div id="sec_minimal_delete" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 scroll-mt-6">
              <h4 className="font-bold text-slate-900">7.5 鏁版嵁鏈€灏忓寲澶勭悊鏂规</h4>
              <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line font-medium pl-1">
                a锛夋嫙鍒犻櫎灞炴€э紙涓庢祦閫氱洰鐨勬棤鍏筹級锛?                <br />
                绉戝
                <br />
                b锛夋渶灏忓寲鍒犻櫎鏃堕棿鐐癸細鍦ㄥ尶鍚嶅寲澶勭悊鏃跺畬鎴?              </div>
            </div>

          </div>
        </div>

        {/* Chapter 8: 8. 闄勫綍 */}
        <div id="sec_fields_list" className="space-y-4 scroll-mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-slate-100 pb-2 mt-6 gap-3">
            <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center space-x-1.5">
              <span>8. 闄勫綍</span>
            </h3>
            
            {/* Search Input Box */}
            <div className="flex items-center space-x-1.5 w-full md:w-80">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="璇疯緭鍏ワ紝鏀寔琛ㄦ牸鍏ㄩ儴鍐呭妫€绱?
                  value={appendixSearchQuery}
                  onChange={(e) => setAppendixSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setActiveAppendixSearch(appendixSearchQuery);
                    }
                  }}
                  className="w-full pl-7 pr-3 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all"
                />
                <span className="absolute left-2.5 top-1.5 text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>
              <button
                onClick={() => setActiveAppendixSearch(appendixSearchQuery)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded transition-colors cursor-pointer"
              >
                鏌ヨ
              </button>
              {activeAppendixSearch && (
                <button
                  onClick={() => {
                    setAppendixSearchQuery("");
                    setActiveAppendixSearch("");
                  }}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded transition-colors cursor-pointer"
                >
                  閲嶇疆
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 mt-3">
            {/* 8.1 缁撴瀯鍖栨枃鏈暟鎹?*/}
            <div id="sec_8_1" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs">8.1 缁撴瀯鍖栨枃鏈暟鎹?/h4>

              {/* 8.1.1 浣忛櫌淇℃伅 */}
              <div id="sec_8_1_1" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-[11px] mb-2.5">8.1.1 浣忛櫌淇℃伅</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁鏍囩</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍖垮悕鍖栨妧鏈?/th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">璇存槑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getFilteredAppendixData(appendixHospitalization, false).length > 0 ? (
                        getFilteredAppendixData(appendixHospitalization, false).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.tag}
                                  onChange={(e) => handleUpdateAppendixHospitalization(item.field, "tag", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TAG_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.tag
                              )}
                            </td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.attr}
                                  onChange={(e) => handleUpdateAppendixHospitalization(item.field, "attr", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {ATTR_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.attr
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.tech}
                                  onChange={(e) => handleUpdateAppendixHospitalization(item.field, "tech", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TECH_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.tech.includes("鍒犻櫎") ? "bg-red-50 text-red-700 border border-red-200" :
                                  item.tech.includes("鍋囧悕") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                  item.tech.includes("淇濈暀鍘熷€?) ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {item.tech}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">
                              {!readOnly ? (
                                <input
                                  type="text"
                                  value={item.note}
                                  onChange={(e) => handleUpdateAppendixHospitalization(item.field, "note", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap leading-normal">{item.note}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">鏃犲尮閰嶇殑鑴辨晱瀛楁</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8.1.2 妫€鏌ヤ俊鎭?*/}
              <div id="sec_8_1_2" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-[11px] mb-2.5">8.1.2 妫€鏌ヤ俊鎭?/h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁鏍囩</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍖垮悕鍖栨妧鏈?/th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">璇存槑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getFilteredAppendixData(appendixExamination, false).length > 0 ? (
                        getFilteredAppendixData(appendixExamination, false).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.tag}
                                  onChange={(e) => handleUpdateAppendixExamination(item.field, "tag", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TAG_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.tag
                              )}
                            </td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.attr}
                                  onChange={(e) => handleUpdateAppendixExamination(item.field, "attr", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {ATTR_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.attr
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.tech}
                                  onChange={(e) => handleUpdateAppendixExamination(item.field, "tech", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TECH_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.tech.includes("鍒犻櫎") ? "bg-red-50 text-red-700 border border-red-200" :
                                  item.tech.includes("鍋囧悕") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                  item.tech.includes("淇濈暀鍘熷€?) ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {item.tech}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">
                              {!readOnly ? (
                                <input
                                  type="text"
                                  value={item.note}
                                  onChange={(e) => handleUpdateAppendixExamination(item.field, "note", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap leading-normal">{item.note}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">鏃犲尮閰嶇殑鑴辨晱瀛楁</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 8.2 褰卞儚鏁版嵁 */}
            <div id="sec_8_2" className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-4 scroll-mt-6">
              <h4 className="font-bold text-slate-900 text-xs">8.2 褰卞儚鏁版嵁</h4>

              {/* 8.2.1 鑵归儴 */}
              <div id="sec_8_2_1" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-[11px] mb-2.5">8.2.1 鑵归儴</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">TAG</th>
                        <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍖垮悕鍖栨妧鏈?/th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">璇存槑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getFilteredAppendixData(appendixAbdominal, true).length > 0 ? (
                        getFilteredAppendixData(appendixAbdominal, true).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-900 font-mono font-bold">{item.tag}</td>
                            <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.attr}
                                  onChange={(e) => handleUpdateAppendixAbdominal(item.tag, "attr", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {ATTR_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.attr
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.tech}
                                  onChange={(e) => handleUpdateAppendixAbdominal(item.tag, "tech", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TECH_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.tech.includes("鍒犻櫎") ? "bg-red-50 text-red-700 border border-red-200" :
                                  item.tech.includes("鍋囧悕") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                  item.tech.includes("淇濈暀鍘熷€?) ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {item.tech}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">
                              {!readOnly ? (
                                <input
                                  type="text"
                                  value={item.note}
                                  onChange={(e) => handleUpdateAppendixAbdominal(item.tag, "note", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap leading-normal">{item.note}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">鏃犲尮閰嶇殑鑴辨晱瀛楁</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8.2.2 鑳搁儴 */}
              <div id="sec_8_2_2" className="bg-white rounded-lg p-4 border border-slate-200 shadow-3xs scroll-mt-6">
                <h5 className="font-bold text-slate-900 text-[11px] mb-2.5">8.2.2 鑳搁儴</h5>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">TAG</th>
                        <th className="p-2 text-left w-36 border-b border-slate-200 bg-slate-100">鏁版嵁瀛楁</th>
                        <th className="p-2 text-left w-24 border-b border-slate-200 bg-slate-100">鏁版嵁灞炴€?/th>
                        <th className="p-2 text-center w-28 border-b border-slate-200 bg-slate-100">鍖垮悕鍖栨妧鏈?/th>
                        <th className="p-2 text-left border-b border-slate-200 bg-slate-100">璇存槑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {getFilteredAppendixData(appendixThoracic, true).length > 0 ? (
                        getFilteredAppendixData(appendixThoracic, true).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-900 font-mono font-bold">{item.tag}</td>
                            <td className="p-2 text-slate-800 font-bold">{item.field}</td>
                            <td className="p-2 text-slate-700">
                              {!readOnly ? (
                                <select
                                  value={item.attr}
                                  onChange={(e) => handleUpdateAppendixThoracic(item.tag, "attr", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {ATTR_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                item.attr
                              )}
                            </td>
                            <td className="p-2 text-center">
                              {!readOnly ? (
                                <select
                                  value={item.tech}
                                  onChange={(e) => handleUpdateAppendixThoracic(item.tag, "tech", e.target.value)}
                                  className="bg-white border border-slate-300 rounded text-[11px] font-bold p-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                >
                                  {TECH_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.tech.includes("鍒犻櫎") ? "bg-red-50 text-red-700 border border-red-200" :
                                  item.tech.includes("鍋囧悕") ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                  item.tech.includes("淇濈暀鍘熷€?) ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                  "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {item.tech}
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">
                              {!readOnly ? (
                                <input
                                  type="text"
                                  value={item.note}
                                  onChange={(e) => handleUpdateAppendixThoracic(item.tag, "note", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap leading-normal">{item.note}</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 font-medium">鏃犲尮閰嶇殑鑴辨晱瀛楁</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export const techMeasuresData = [
  { measure: "韬唤璁よ瘉锛堝鍥犵礌閴村埆锛?, status: "婊¤冻" },
  { measure: "璁块棶鎺у埗锛堝姛鑳芥潈闄?鏁版嵁鏉冮檺锛?, status: "婊¤冻" },
  { measure: "瀹夊叏闅旂锛堜笉鍚屾帴鏀舵柟閫昏緫/鐗╃悊闅旂锛?, status: "婊¤冻" },
  { measure: "鍔犲瘑淇濇姢锛堟晱鎰熸暟鎹姞瀵嗗瓨鍌級", status: "婊¤冻" },
  { measure: "瀹夊叏浼犺緭锛堜紶杈撳姞瀵嗭級", status: "婊¤冻" },
  { measure: "鏁版嵁閿€姣侊紙浠诲姟瀹屾垚鍚庡垹闄ゅ師濮嬫暟鎹拰涓棿缁撴灉锛?, status: "寰呭畬鍠? },
  { measure: "鏁版嵁闃叉硠婕?, status: "婊¤冻" },
  { measure: "闄勫姞淇℃伅淇濇姢锛堝亣鍚嶅寲闄勫姞淇℃伅闅旂鍔犲瘑锛?, status: "婊¤冻" },
  { measure: "鎺ュ彛瀹夊叏婊¤冻瀹夊叏瀹¤", status: "婊¤冻" },
  { measure: "瀹瑰櫒鍖?铏氭嫙鍖栭殧绂汇€佺幆澧冪鎺э紙闃绘柇鏀诲嚮/闃叉闈為鏈熻緭鍏ヨ緭鍑猴級銆佸畬鏁存搷浣滄棩蹇?, status: "婊¤冻" }
];

export const mgmtMeasuresData = [
  { subject: "鏁版嵁鎸佹湁鏂?, measure: "鏁版嵁娴侀€氱鐞嗗埗搴?, status: "寰呭畬鍠? },
  { subject: "鏁版嵁鎸佹湁鏂?, measure: "瀹℃牳闇€姹傛柟浣跨敤鍦烘櫙銆佺洰鐨勫拰澶勭悊娴佺▼", status: "婊¤冻" },
  { subject: "鏁版嵁鎸佹湁鏂?, measure: "鍚堝悓绾︽潫锛堢洰鐨勮寖鍥?鏁版嵁淇濇姢涔夊姟/绂佹閲嶈瘑鍒?娉勯湶閫氱煡绛夛級", status: "婊¤冻" },
  { subject: "鏁版嵁鎸佹湁鏂?, measure: "鏄庣‘浜哄憳鑱岃矗骞跺畾鏈熷煿璁?, status: "婊¤冻" },
  { subject: "鏁版嵁鎸佹湁鏂?, measure: "鐣欏瓨鍖垮悕鍖栫瓥鐣ャ€佽鍒欏埗瀹?瀹℃牳/鏇存柊璁板綍", status: "寰呭畬鍠? },
  { subject: "鏁版嵁鎸佹湁鏂?, measure: "鍒跺畾搴旀€ラ妗堝苟瀹氭湡婕旂粌", status: "婊¤冻" },
  { subject: "鏁版嵁鎸佹湁鏂?, measure: "鎸佺画鐩戞帶椋庨櫓锛屽畾鏈熸洿鏂扮瓥鐣?, status: "婊¤冻" },
  { subject: "鏁版嵁鎸佹湁鏂?, measure: "瀹℃牳闇€姹傛柟浣跨敤鍦烘櫙銆佺洰鐨勫拰澶勭悊娴佺▼", status: "婊¤冻" },
  { subject: "鏁版嵁浣跨敤鏂?, measure: "鎸夋渶灏戝鐢ㄥ師鍒欑敵璇锋暟鎹?, status: "婊¤冻" },
  { subject: "鏁版嵁浣跨敤鏂?, measure: "鍚堝悓绾︽潫", status: "婊¤冻" },
  { subject: "鏁版嵁浣跨敤鏂?, measure: "绂佹閲嶈瘑鍒涓?, status: "婊¤冻" },
  { subject: "鏁版嵁浣跨敤鏂?, measure: "瀵规帴瑙︿汉鍛樺煿璁苟绛剧讲淇濆瘑鍗忚", status: "婊¤冻" },
  { subject: "鏁版嵁浣跨敤鏂?, measure: "鏉冮檺绂昏亴绂诲矖鍥炴敹鏈哄埗", status: "婊¤冻" },
  { subject: "鏁版嵁浣跨敤鏂?, measure: "鏁版嵁浣跨敤鐩戞帶", status: "婊¤冻" },
  { subject: "鏁版嵁浣跨敤鏂?, measure: "鏁版嵁閿€姣?, status: "婊¤冻" },
  { subject: "鏁版嵁杩愯惀鏂?, measure: "鎻愪緵骞跺叕鍛婂畨鍏ㄦ妧鏈兘鍔?, status: "婊¤冻" },
  { subject: "鏁版嵁杩愯惀鏂?, measure: "瀹氭湡瀹夊叏璇勪及", status: "婊¤冻" },
  { subject: "鏁版嵁杩愯惀鏂?, measure: "涓ユ牸璁块棶鎺у埗", status: "婊¤冻" },
  { subject: "鏁版嵁杩愯惀鏂?, measure: "瀵圭浉鍏虫柟鎿嶄綔鐣欏瓨鏃ュ織骞跺畾鏈熷璁?, status: "婊¤冻" },
  { subject: "鏁版嵁杩愯惀鏂?, measure: "搴旀€ラ妗堟紨缁?, status: "婊¤冻" }
];

export const dataCompositionData = [
  { category: "缁撴瀯鍖栨暟鎹?, content: "浜哄彛瀛︿俊鎭紙鎮ｈ€呮爣璇嗐€佸氨璇婂彿锛夈€佷綇闄俊鎭€佹鏌ヤ俊鎭€佹楠岃褰曘€佸尰鍢辫褰? },
  { category: "褰卞儚鏁版嵁", content: "DICOM褰卞儚" },
  { category: "鍥剧墖鏁版嵁", content: "鍥惧儚" }
];

export const dataAttributeSplittingData = [
  { attr: "鐩存帴鏍囪瘑绗?, category: "鏂囨湰鏁版嵁-浣忛櫌淇℃伅", field: "鎮ｈ€呮爣璇嗗彿", tag: "-", necessity: "涓庢祦閫氱洰鐨勬棤鍏筹紝椤诲垹闄ゆ垨鍋囧悕鍖栧鐞? },
  { attr: "鐩存帴鏍囪瘑绗?, category: "鏂囨湰鏁版嵁-浣忛櫌淇℃伅", field: "璁板綍鍐呭", tag: "鎮ｈ€呭鍚?, necessity: "涓庢祦閫氱洰鐨勬棤鍏筹紝椤诲垹闄ゆ垨鍋囧悕鍖栧鐞? },
  { attr: "鐩存帴鏍囪瘑绗?, category: "鏂囨湰鏁版嵁-浣忛櫌淇℃伅", field: "璁板綍鍐呭", tag: "鍖荤敓濮撳悕", necessity: "涓庢祦閫氱洰鐨勬棤鍏筹紝椤诲垹闄ゆ垨鍋囧悕鍖栧鐞? },
  { attr: "鐩存帴鏍囪瘑绗?, category: "DICOM褰卞儚", field: "Accession Number", tag: "-", necessity: "涓庢祦閫氱洰鐨勬棤鍏筹紝椤诲垹闄ゆ垨鍋囧悕鍖栧鐞? },
  { attr: "鐩存帴鏍囪瘑绗?, category: "DICOM褰卞儚", field: "Referring Physician Name", tag: "-", necessity: "涓庢祦閫氱洰鐨勬棤鍏筹紝椤诲垹闄ゆ垨鍋囧悕鍖栧鐞? },
  { attr: "鍑嗘爣璇嗙", category: "鏂囨湰鏁版嵁-浣忛櫌淇℃伅", field: "灏辫瘖鏃堕棿", tag: "-", necessity: "鍙帴鍙楃簿搴︽崯澶憋紝椤诲幓鏍囪瘑鍖栧鐞? },
  { attr: "鍑嗘爣璇嗙", category: "鏂囨湰鏁版嵁-浣忛櫌淇℃伅", field: "璁板綍鍐呭", tag: "鍖婚櫌鍚嶇О", necessity: "鍙帴鍙楃簿搴︽崯澶憋紝椤诲幓鏍囪瘑鍖栧鐞? },
  { attr: "鍑嗘爣璇嗙", category: "DICOM褰卞儚", field: "Implementation Class UID", tag: "-", necessity: "鍙帴鍙楃簿搴︽崯澶憋紝椤诲幓鏍囪瘑鍖栧鐞? },
  { attr: "鏈€灏忓寲鍒犻櫎", category: "鏂囨湰鏁版嵁-浣忛櫌淇℃伅", field: "绉戝", tag: "-", necessity: "鏈€灏忓寲澶勭悊锛屽垹闄ゅ悗涓嶇撼鍏ユ祦閫氭暟鎹泦" },
  { attr: "鏁忔劅灞炴€?, category: "-", field: "鏁忔劅灞炴€т腑鍖呭惈鐨勭洿鎺ユ爣璇嗙涓庡噯鏍囪瘑绗﹀凡澶勭悊", tag: "-", necessity: "涓哄疄鐜颁娇鐢ㄧ洰鐨勫繀闇€锛屽敖閲忎繚鐣欏師鍊兼垨淇敼" }
];

export const hospitalizationFieldsData = [
  { field: "鎮ｈ€呮爣璇嗗彿", tag: "-", attr: "鐩存帴鏍囪瘑绗?, tech: "鍋囧悕鍖?鍏ㄥ眬)", note: "閲囩敤涓嶅彲閫嗗姞瀵嗙畻娉曪紝鐢熸垚16浣嶅搱甯屽€? },
  { field: "灏辫瘖鍙?, tag: "-", attr: "鐩存帴鏍囪瘑绗?, tech: "鍋囧悕鍖?, note: "閲囩敤涓嶅彲閫嗗姞瀵嗙畻娉曪紝鐢熸垚16浣嶅搱甯屽€? },
  { field: "璁板綍鍐呭", tag: "鎮ｈ€呭鍚?, attr: "鐩存帴鏍囪瘑绗?, tech: "灞炴€у垹闄?, note: "鏇挎崲涓?" },
  { field: "璁板綍鍐呭", tag: "鍖荤敓濮撳悕", attr: "鐩存帴鏍囪瘑绗?, tech: "灞炴€у垹闄?, note: "鏇挎崲涓?" },
  { field: "璁板綍鍐呭", tag: "骞撮緞", attr: "鍑嗘爣璇嗙", tech: "娉涘寲", note: "鏆傚畾5宀佷负涓€鍖洪棿娈礬n15-19锛?5宀乗n锛?0-24锛?0宀乗n锛浡仿穃n锛?0浠ヤ笂锛?0宀乗n锛涘疄闄呭鐞嗘椂鏍规嵁骞撮緞鍒嗗竷鎯呭喌纭畾娉涘寲缁村害" },
  { field: "灏辫瘖鏃堕棿", tag: "-", attr: "鍑嗘爣璇嗙", tech: "鎵板姩(鍏ㄥ眬)", note: "XXXX骞碭X鏈圶X鏃ワ紝鏃跺垎绉掍笉淇濈暀锛屽悜鍓?鍚庡亸绉荤壒瀹氬ぉ鏁帮紝淇濇寔鍚屼竴鎮ｈ€呯殑鎵€鏈夋棩鏈熺被瀛楁鍋忕Щ閲忎竴鑷达紝涓嶅悓鎮ｈ€呯殑鍋忕Щ閲忎笉涓€鑷? }
];

export const examinationFieldsData = [
  { field: "鎮ｈ€呮爣璇嗗彿", tag: "-", attr: "鐩存帴鏍囪瘑绗?, tech: "鍋囧悕鍖?鍏ㄥ眬)", note: "閲囩敤涓嶅彲閫嗗姞瀵嗙畻娉曪紝鐢熸垚16浣嶅搱甯屽€? },
  { field: "灏辫瘖鍙?, tag: "-", attr: "鐩存帴鏍囪瘑绗?, tech: "鍋囧悕鍖?, note: "閲囩敤涓嶅彲閫嗗姞瀵嗙畻娉曪紝鐢熸垚16浣嶅搱甯屽€? },
  { field: "璁板綍鏃堕棿", tag: "-", attr: "鍑嗘爣璇嗙", tech: "鎵板姩(鍏ㄥ眬)", note: "XXXX骞碭X鏈圶X鏃ワ紝鏃跺垎绉掍笉淇濈暀锛屽悜鍓?鍚庡亸绉荤壒瀹氬ぉ鏁帮紝淇濇寔鍚屼竴鎮ｈ€呯殑鎵€鏈夋棩鏈熺被瀛楁鍋忕Щ閲忎竴鑷达紝涓嶅悓鎮ｈ€呯殑鍋忕Щ閲忎笉涓€鑷? }
];

export const abdominalFieldsData = [
  { tag: "(0002,0002)", field: "Media Storage SOP Class UID", attr: "鍑嗘爣璇嗙", tech: "鍋囧悕鍖?, note: "鏇挎崲涓哄姞瀵嗗瓧绗︿覆" },
  { tag: "(0002,0003)", field: "Media Storage SOP Instance UID", attr: "鍑嗘爣璇嗙", tech: "鍋囧悕鍖?, note: "鏇挎崲涓哄姞瀵嗗瓧绗︿覆" },
  { tag: "(0002,0012)", field: "Implementation Class UID", attr: "鍑嗘爣璇嗙", tech: "灞炴€у垹闄?, note: "缃┖" },
  { tag: "(0002,0013)", field: "Implementation Version Name", attr: "鍑嗘爣璇嗙", tech: "灞炴€у垹闄?, note: "缃┖" },
  { tag: "(0008,0018)", field: "SOP Instance UID", attr: "鍑嗘爣璇嗙", tech: "鍋囧悕鍖?, note: "UID涓€鑷存€ф浛鎹? }
];

export const thoracicFieldsData = [
  { tag: "(0002,0002)", field: "Media Storage SOP Class UID", attr: "鍑嗘爣璇嗙", tech: "鍋囧悕鍖?, note: "鏇挎崲涓哄姞瀵嗗瓧绗︿覆" },
  { tag: "(0002,0003)", field: "Media Storage SOP Instance UID", attr: "鍑嗘爣璇嗙", tech: "鍋囧悕鍖?, note: "鏇挎崲涓哄姞瀵嗗瓧绗︿覆" },
  { tag: "(0002,0016)", field: "Source Application Entity Title", attr: "鍑嗘爣璇嗙", tech: "灞炴€у垹闄?, note: "缃┖" },
  { tag: "(0008,0018)", field: "SOP Instance UID", attr: "鍑嗘爣璇嗙", tech: "鍋囧悕鍖?, note: "UID涓€鑷存€ф浛鎹? },
  { tag: "(0008,0020)", field: "Study Date", attr: "鍑嗘爣璇嗙", tech: "鎵板姩(鍏ㄥ眬)", note: "鍚戝墠/鍚庡亸绉荤壒瀹氬ぉ鏁帮紝浠呬繚鐣欏勾/鏈?鏃? }
];

export const appendixHospitalizationFieldsData = [
  ...hospitalizationFieldsData,
  { field: "绉戝", tag: "-", attr: "鏁忔劅灞炴€?, tech: "鏈€灏忓寲鍒犻櫎", note: "渚嬪 蹇冨唴绉? },
  { field: "鍏ラ櫌璇婃柇", tag: "-", attr: "鏁忔劅灞炴€?, tech: "淇濈暀鍘熷€?, note: "渚嬪 鎱㈡€т箼鍨嬬梾姣掓€ц倽鐐庯紱鑲濈‖鍖? },
  { field: "璁板綍鍚嶇О", tag: "-", attr: "鏁忔劅灞炴€?, tech: "淇濈暀鍘熷€?, note: "渚嬪 棣栨鐥呯▼璁板綍" }
];

export const appendixExaminationFieldsData = [
  ...examinationFieldsData,
  { field: "绉戝", tag: "-", attr: "鏁忔劅灞炴€?, tech: "鏈€灏忓寲鍒犻櫎", note: "" },
  { field: "璁板綍鍚嶇О", tag: "-", attr: "鏁忔劅灞炴€?, tech: "淇濈暀鍘熷€?, note: "渚嬪 涓婅吂閮ㄧ鍏辨尟澧炲己鎴愬儚" }
];

export const appendixThoracicFieldsData = [
  ...abdominalFieldsData,
  { tag: "(0020,0011)", field: "Series Number", attr: "鏁忔劅灞炴€?, tech: "淇濈暀鍘熷€?, note: "" }
];

export const appendixAbdominalFieldsData = [
  ...thoracicFieldsData,
  { tag: "(0020,0011)", field: "Series Number", attr: "鏁忔劅灞炴€?, tech: "淇濈暀鍘熷€?, note: "" }
];

export const TAG_OPTIONS = ["-", "鎮ｈ€呭鍚?, "鍖荤敓濮撳悕", "骞撮緞", "鍖婚櫌鍚嶇О", "灏辫瘖鏃堕棿", "璁板綍鏃堕棿", "绉戝鍚嶇О", "鐤剧梾璇婃柇", "鑽搧鍚嶇О", "鎵嬫湳鎿嶄綔"];
export const ATTR_OPTIONS = ["鐩存帴鏍囪瘑绗?, "鍑嗘爣璇嗙", "鏈€灏忓寲鍒犻櫎", "鏁忔劅灞炴€?];
export const TECH_OPTIONS = ["鍋囧悕鍖?鍏ㄥ眬)", "鍋囧悕鍖?, "灞炴€у垹闄?, "娉涘寲", "鎵板姩(鍏ㄥ眬)", "鏈€灏忓寲鍒犻櫎", "淇濈暀鍘熷€?];

const defaultSchemeTexts = {
  sec1: "鍚堟硶鍚堣鍘熷垯锛氫弗鏍奸伒寰€婂仴搴峰尰鐤楁暟鎹尶鍚嶅寲鎶€鏈鑼?璇曡)銆嬬瓑鐩稿叧娉曡鏍囧噯锛岀‘淇濇暟鎹鐞嗗叏娴佺▼绗﹀悎鍥藉闅愮淇濇姢涓庢暟鎹畨鍏ㄨ姹傘€俓n骞宠　鏁堢敤鍘熷垯锛氬湪婊¤冻鍖垮悕鍖栧畨鍏ㄦ爣鍑嗙殑鍓嶆彁涓嬶紝鏈€澶ч檺搴︿繚鐣欐暟鎹殑涓村簥鐗瑰緛涓庢妧鏈环鍊硷紝纭繚鍖垮悕鍖栧悗鐨勬暟鎹彲婊¤冻闇€姹傛柟鐨勪娇鐢ㄥ満鏅€俓n鍒嗙被鍒嗙骇鍘熷垯锛氭牴鎹暟鎹彲璇嗗埆绋嬪害鍙婃祦閫氬満鏅紝閲囩敤宸紓鍖栧尶鍚嶅寲鎶€鏈笌椋庨櫓绠＄悊鎺柦銆俓n涓嶅彲閫嗗師鍒欙細纭繚鍖垮悕鍖栧鐞嗗悗鐨勬暟鎹棤娉曢€氳繃鍚堢悊鎶€鏈墜娈靛鍘熶负鍘熷鏁版嵁锛屼笖涓嶈兘璇嗗埆鐗瑰畾鑷劧浜恒€俓n鍏ㄦ祦绋嬭拷婧師鍒欙細寤虹珛鍖垮悕鍖栧鐞嗗叏鐜妭鏃ュ織璁板綍锛屽疄鐜版搷浣滃彲瀹¤銆佽繃绋嬪彲杩芥函銆佽矗浠诲彲杩界┒銆?,
  sec2: "銆婂仴搴峰尰鐤楁暟鎹尶鍚嶅寲鎶€鏈鑼?(璇曡)銆嬨€婂尰瀛︽暟瀛楁垚鍍忎笌閫氫俊鏍囧噯銆嬶紙PS3.15 Annex E锛?,
  sec3: "棣栭兘鍖荤澶у闄勫睘鍖椾含绉按娼尰闄綔涓轰竴鎵€浠ラ绉戙€佺儳浼ょ涓洪噸鐐瑰绉戠殑涓夌骇鐢茬瓑缁煎悎鍖婚櫌锛屽凡绯荤粺鎬хН绱簡瑙勬ā搴炲ぇ鐨勭儳浼ょ鏁版嵁闆嗐€傚尰闄㈡嫙鏍规嵁娴峰崡灏忚嵎鍋ュ悍缃戠粶鎶€鏈湁闄愬叕鍙哥殑闇€姹傦紝鍦ㄥ尶鍚嶅寲澶勭悊鍚庯紝鍚戞捣鍗楀皬鑽峰仴搴风綉缁滄妧鏈湁闄愬叕鍙歌繘琛屽悎瑙勬祦閫氾紝鐢ㄤ簬鍖荤枟澶фā鍨嬭兘鍔涜瘎浼颁笌浼樺寲銆?,
  sec4_1: "闅忕潃AI妯″瀷鍦ㄧ儳浼や笓绉戣緟鍔╄瘖鐤椼€佹暀瀛﹁川鎺х瓑鍦烘櫙鐨勬帰绱㈡棩鐩婃繁鍏ワ紝鏋勫缓涓€濂楁爣鍑嗗寲銆侀珮璐ㄩ噺涓斿厖鍒嗗弽鏄犵湡瀹炰复搴婂鏍锋€х殑璇勬祴鏁版嵁闆嗭紝宸叉垚涓鸿　閲忔ā鍨嬩笓绉戣兘鍔涚殑鍏抽敭鐡堕銆傚ぇ妯″瀷浼佷笟鎷熷埄鐢ㄧН姘存江鍖婚櫌鐑т激涓撶鐨勭湡瀹炰复搴婃暟鎹紝鏋勫缓鐑т激涓撶妯″瀷璇勬祴鏁版嵁闆嗭紝浣嗚嫢浠呬緷闈犲墠鐬绘€ф敹闆嗘柊鍙戠梾渚嬪苟閫愪緥鑾峰彇鐭ユ儏鍚屾剰锛屼笉浠呯儳浼ょ梾渚嬬殑瀛ｈ妭鎬с€佺獊鍙戞€у垎甯冮毦浠ュ湪鐭湡鍐呰鐩栧悇绫讳激鎯呰氨绯伙紝涓旀牱鏈Н绱紦鎱紝闅句互婊¤冻妯″瀷杩唬涓庨獙璇佺殑鏃舵晥瑕佹眰銆俓n瀵圭Н姘存江鍖婚櫌鐑т激涓撶涓村簥鏁版嵁闆嗗疄鏂藉尶鍚嶅寲澶勭悊锛屽彲鍦ㄥ垏瀹炰繚闅滄偅鑰呴殣绉佹潈鐩婄殑鍓嶆彁涓嬶紝灏嗗叾鍚堟硶搴旂敤浜庤瘎娴嬫暟鎹泦鐨勬瀯寤轰笌鍐呴儴妯″瀷璇勬祴宸ヤ綔銆傚尶鍚嶅寲澶勭悊瀵瑰鍚嶃€佹偅鑰呯紪鍙风瓑鐩存帴鏍囪瘑绗︿簣浠ュ垹闄わ紝骞跺閮ㄥ垎鍑嗘爣璇嗙杩涜蹇呰鐨勬硾鍖栵紝灏界鍙兘鎹熷け涓埆瀛楁鐨勭粏绮掑害锛屼絾瀵硅瘎娴嬫墍蹇呴渶鐨勬牳蹇冧复搴婄壒寰佲€斺€斿鐑т激鍘熷洜銆佺儳浼ゆ€婚潰绉笌娣卞害鍒嗗竷銆佹槸鍚﹀悎骞跺惛鍏ユ€ф崯浼ゃ€佹恫浣撳鑻忔柟妗堛€佹墜鏈搷浣溿€佹劅鏌撴帶鍒朵笌鎰堝悎缁撳眬绛夛紝鍧囧彲瀹屾暣淇濈暀锛屼笉褰卞搷璇勬祴鐩爣鐨勮揪鎴愩€傛湰鍦烘櫙涓嬫暟鎹尶鍚嶅寲澶勭悊鍏峰鑹ソ鐨勫彲琛屾€э細棣栧厛锛岀Н姘存江鍖婚櫌鐑т激绉戞彁渚涚殑涓村簥鏁版嵁闆嗕笓娉ㄤ簬鐑т激涓撶锛屾弧瓒虫瀯寤鸿瘎娴嬫暟鎹泦鎵€闇€鐨勬渶灏忔暟鎹寖鍥达紝涓旀暟鎹互缁撴瀯鍖栬褰曚负涓伙紝杈呬互鏍囧噯鍖栫殑鐥呯▼鎽樿锛屽唴瀹归潤鎬併€佹牸寮忚鑼冿紝鍖垮悕鍖栨妧鏈鐞嗚矾寰勬竻鏅帮紱鍏舵锛屼笌妯″瀷璇勬祴楂樺害鐩稿叧鐨勫叧閿壒寰侊紝濡傚熀纭€浜哄彛瀛︿俊鎭€佺儳浼ゆ満鍒朵笌涓ラ噸搴﹁瘎鍒嗐€佹墜鏈褰曘€佷綇闄㈣褰曘€佸嚭闄㈣褰曠瓑锛屽潎鍙湪绉婚櫎鐩存帴鏍囪瘑绗﹀苟瀵瑰噯鏍囪瘑绗︿綔娉涘寲澶勭悊鍚庝繚鐣欙紝鏁版嵁鏁堢敤鏈彈鏈川褰卞搷锛涘啀娆★紝鏁版嵁闆嗕粎闄愬畾鐢ㄤ簬璇ヤ紒涓氬唴閮ㄨ瘎娴嬪洟闃熷湪灏侀棴瀹夊叏璁＄畻鐜涓爣娉ㄤ笌璇勬祴浣跨敤锛岀姝㈠澶栧垎鍙戜笌璺ㄥ煙娴侀€氾紝鍦ㄤ弗鏍肩殑鏁版嵁闅旂涓庡悎鍚岀害鏉熶笅锛屽璇嗗埆椋庨櫓鏋佷綆锛涙渶鍚庯紝璇ユ暟鎹泦瑙勬ā鍙帶锛屽尶鍚嶅寲鎵€闇€鐨勮劚鏁忓伐鍏枫€佽绠楄祫婧愬強瀹炴柦鎴愭湰鍧囧湪椤圭洰棰勭畻鍙帴鍙楄寖鍥村唴锛屼笉浼氬璇勬祴鏁版嵁闆嗘瀯寤虹殑鏁翠綋鐮斿彂杩涘害鏋勬垚璐熸媴銆?,
  sec4_2: "鏈暟鎹泦鐨勬祦閫氬満鏅负鏈夊悎鍚岀害鏉熺殑鐗瑰畾鍚堜綔鏂瑰叡浜紝涓斿悎浣滄柟浠呮湁涓€涓紝灞炰簬鍙楁帶鍏紑鍏变韩涓殑缁勭粐澶栭儴涓ゆ柟鐨勬暟鎹祦閫氾紝鍦烘櫙绯绘暟鍙彇1/5銆?,
  sec5: "鏈竻娲楄寖鍥翠弗鏍肩晫瀹氬湪锛?11涓牳蹇冪粨鏋勫寲涓村簥闅忚瀛楁銆佸叧鑱旂殑涓村簥鍘熺敓鎬佸僵鐓у強鍖诲鍥剧墖锛圝PG/PNG锛夈€佷互鍙奃R/CT/MRI绛夋斁灏勭褰卞儚搴忓垪锛圖ICOM 鏍煎紡锛夈€?,
  sec6: "1. 鎮ｈ€呭鍚嶃€佽韩浠借瘉銆侀棬璇婂彿绛夌洿鎺ユ爣璇嗙 100% 娑堥櫎锛沑n2. 缁撴瀯鍖栭殢璁挎棩鏈熴€佸氨璇婃椂闂淬€佹鏌ユ棩鏈熸墽琛屼弗鏍肩殑妯℃€佸榻愮瓑璺濇壈鍔ㄧ畻娉曪紝淇濊瘉鏃跺簭宸€笺€侀殢璁块棿闅斿畬缇庝繚鎸侊紱\n3. 褰卞儚鍥惧儚鍐呭彲鑳藉寘鍚殑鐑у綍濮撳悕绾㈠瓧 and 浜鸿劯淇℃伅 100% 娑堥櫎锛屼笖淇濋殰鑴辨晱鍚庢暟鎹彲閲嶇畻 K 鍖垮悕闂ㄦ锛屾潨缁濆弽鍚戞帹瀵笺€?,
  sec7_1: "渚濇嵁銆婂仴搴峰尰鐤楁暟鎹尶鍚嶅寲鎶€鏈鑼冿紙璇曡锛夈€?.1绔犺妭锛屽鏈鏁版嵁鍖垮悕鍖栬繘琛岀壒瀹氭弿杩般€?,
  sec7_2: "渚濇嵁銆婂仴搴峰尰鐤楁暟鎹尶鍚嶅寲鎶€鏈鑼?璇曡)銆?6.2.1绔犺妭銆?.2.2绔犺妭锛屽DICOM鏍囩鏁版嵁澶勭悊鍜屾鏌ュ奖鍍忕殑鍖垮悕鍖栬鏄庯紝瀵规湰娆℃暟鎹尶鍚嶅寲杩涜鐗瑰畾鎻忚堪銆?,
  sec7_3: "鍖诲褰╁浘鎴栨憚褰辫澶囪緭鍑虹殑鍥惧儚鏂囦欢涓紝缁忓父鍦ㄥ浘鍍忓簳閮ㄣ€佷晶杈规垨鍥涘懆鐩存帴鐑у綍鏈夋偅鑰呯殑灏辫瘖鍗″彿銆佹嫾闊冲鍚嶃€佹媿鎽勬椂闂存垨璁惧鍙傛暟淇℃伅锛堢孩榛勭豢瀛楋級銆傛湰鏂规鍦ㄧ墿鐞嗗浘鍍忓眰闈紝閲囩敤鍏堣繘鐨勫熀浜庢繁搴﹀涔狅紙OCR-Detection锛夌殑绔埌绔枃鏈娴嬪畾浣嶆ā鍨嬶紝鑷姩妫€绱㈠浘鍍忎腑鐨勫瓧绗﹀尯銆傚鍒ゅ畾灞炰簬鏁忔劅灞炴€х殑鐭╁舰鍍忕礌鍖咃紙BBox锛夛紝閲囩敤楂樻柉妯＄硦鎴栧叏榛戝儚绱犲～鍏呴伄钄斤紙Masking锛夛紝鑴辨晱绮惧害杈?99.8% 浠ヤ笂锛屼繚闅滆倝鐪间笉鍙銆佹満鍣ㄤ笉鍙鲸銆?,
  sec7_4_1: "閫氳繃闄㈠唴缁熶竴鐨勫尶鍚嶆槧灏勫瓧鍏告湇鍔★紙Anonymization Registry锛夛紝鍚勬ā鎬侊紙CSV/DICOM/褰╃収锛夊湪瀵煎嚭鑴辨晱鍖呮椂锛屼娇鐢ㄥ悓涓€濂楃敓鎴愮殑鍝堝笇鍋囧悕 ID锛堝嵆 32 浣嶅敮涓€ PatientID 鍝堝笇鍊硷級锛屼綔涓鸿法妯℃€佸婧愭暟鎹殑鑱旀帴涓婚敭锛圝oint-Key锛夛紝婊¤冻鍦ㄥ涓績鐮旂┒涓浘鍍忎笌鏂囨湰琛岀殑涓€涓€閰嶅瑕佹眰銆?,
  sec7_4_2: "鏀惧皠妫€鏌ョ敓鎴愮殑鈥淒ose Report鈥濓紙鍓傞噺鎶ュ憡锛夊浘鍍忎腑锛岀櫨鍒嗕箣鐧炬槑鏂囩儳褰曟湁璁惧娉ㄥ唽缂栫爜銆佹偅鑰呯湡瀹炴嫾闊冲鍚嶅強闂ㄨ瘖鍙枫€傛湰鏂规寮哄埗杩囨护鍣細瀵?DICOM 灞炴€?SeriesDescription (0008,103e) 鍖呭惈 'Dose' / 'Report' / 'Artifact' 瀛楁牱鐨勫崟甯ф垨澶氬抚搴忓垪褰卞儚锛屼竴寰嬭嚜鍔ㄦ墽琛屾暣搴忓垪鐗╃悊鍓旈櫎锛屼笉浜堝鍑恒€?,
  sec7_4_3: "浠呬繚鐣?DICOM 灞炴€?ImageType (0008,0008) 涓?'ORIGINAL\\PRIMARY' 鐨勫師濮嬩笁缁存柇灞傚垏鐗囷紝鎺掗櫎鎵€鏈夌粡杩囦簩娆″悗澶勭悊銆佸悎鎴愮殑涓夌淮闈㈤儴閲嶅缓棰勮鍥炬垨鍖呭惈鏁忔劅涓村簥鏍囨敞鐨勪簩娆℃垚鍍忥紝鍒囨柇浜鸿劯鑲栧儚閲嶆爣璇嗚矾寰勩€?,
  sec7_4_4: "鍦ㄥ幓鏍囪瘑娴佸嚭鐨勭粓鐐圭珯锛屾牎楠?DICOM 鍍忕礌灏哄銆佷綋绱犻棿璺濓紙Spacing锛夌瓑绌洪棿鐗╃悊甯告暟锛岀‘淇濆幓鏍囪瘑鎿嶄綔鏈鍘熷绉戠爺鐭╅樀鏂藉姞鍑犱綍褰㈠彉锛屼繚璇佺畻娉曠鐮旇缁冪殑绉戝瀹屾暣鎬с€?
};

export default function EditableSchemeForm({ project, onBack, onSaved, onRegenerate }: EditableSchemeFormProps) {
  const [isViewingInitial, setIsViewingInitial] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [showRegenerateAlert, setShowRegenerateAlert] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>(project);

  const handleStartEditing = () => {
    setSnapshot({
      schemeTexts: { ...schemeTexts },
      appendixHospitalization: JSON.parse(JSON.stringify(appendixHospitalization)),
      appendixExamination: JSON.parse(JSON.stringify(appendixExamination)),
      appendixThoracic: JSON.parse(JSON.stringify(appendixThoracic)),
      appendixAbdominal: JSON.parse(JSON.stringify(appendixAbdominal)),
    });
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (snapshot) {
      setSchemeTexts(snapshot.schemeTexts);
      setAppendixHospitalization(snapshot.appendixHospitalization);
      setAppendixExamination(snapshot.appendixExamination);
      setAppendixThoracic(snapshot.appendixThoracic);
      setAppendixAbdominal(snapshot.appendixAbdominal);
    }
    setIsEditing(false);
  };

  const handleSaveEditing = async () => {
    setIsEditing(false);
    try {
      const res = await apiFetch(`/api/projects/${project.id}/scheme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeData: schemeTexts,
          schemeDocText: Object.values(schemeTexts).join("\n\n")
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          project.schemeData = schemeTexts;
          project.schemeDocText = data.project.schemeDocText;
          project.updatedAt = data.project.updatedAt;
        }
      }
    } catch (err) {
      console.error("Failed to save scheme text update:", err);
    }
    if (onSaved) onSaved();
  };
  const [schemeTexts, setSchemeTexts] = useState<any>(() => {
    if (project.schemeData && typeof project.schemeData === "object") {
      return { ...defaultSchemeTexts, ...project.schemeData };
    }
    return defaultSchemeTexts;
  });

  // States for editable scheme parameters
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [techMeasures, setTechMeasures] = useState(techMeasuresData);
  const [mgmtMeasures, setMgmtMeasures] = useState(mgmtMeasuresData);
  const [dataComposition, setDataComposition] = useState(dataCompositionData);

  // States for appendix data lists
  const [appendixHospitalization, setAppendixHospitalization] = useState(appendixHospitalizationFieldsData);
  const [appendixExamination, setAppendixExamination] = useState(appendixExaminationFieldsData);
  const [appendixThoracic, setAppendixThoracic] = useState(appendixThoracicFieldsData);
  const [appendixAbdominal, setAppendixAbdominal] = useState(appendixAbdominalFieldsData);

  // Computed field mappings for sub-sections
  const hospitalization711Fields = appendixHospitalization.filter(item => 
    hospitalizationFieldsData.some(h => h.field === item.field)
  );
  const examination712Fields = appendixExamination.filter(item => 
    examinationFieldsData.some(h => h.field === item.field)
  );
  const abdominal721Fields = appendixAbdominal.filter(item => 
    abdominalFieldsData.some(h => h.tag === item.tag)
  );
  const thoracic722Fields = appendixThoracic.filter(item => 
    thoracicFieldsData.some(h => h.tag === item.tag)
  );
  const minimizedFields = [
    ...appendixHospitalization.map(item => ({ ...item, category: "鏂囨湰鏁版嵁-浣忛櫌淇℃伅" })),
    ...appendixExamination.map(item => ({ ...item, category: "鏂囨湰鏁版嵁-妫€鏌ヤ俊鎭? })),
    ...appendixThoracic.map(item => ({ ...item, category: "褰卞儚鏁版嵁-鑳搁儴" })),
    ...appendixAbdominal.map(item => ({ ...item, category: "褰卞儚鏁版嵁-鑵归儴" }))
  ].filter(item => item.tech === "鏈€灏忓寲鍒犻櫎");

  const onChangeText = async (key: string, value: string) => {
    const updatedTexts = { ...schemeTexts, [key]: value };
    setSchemeTexts(updatedTexts);

    try {
      const res = await apiFetch(`/api/projects/${project.id}/scheme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeData: updatedTexts,
          schemeDocText: Object.values(updatedTexts).join("\n\n")
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          project.schemeData = updatedTexts;
          project.schemeDocText = data.project.schemeDocText;
          project.updatedAt = data.project.updatedAt;
        }
      }
    } catch (err) {
      console.error("Failed to save scheme text update:", err);
    }
  };

  const handleRestoreInitial = async () => {
    setSchemeTexts(defaultSchemeTexts);
    setIsViewingInitial(false);

    try {
      const res = await apiFetch(`/api/projects/${project.id}/scheme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeData: defaultSchemeTexts,
          schemeDocText: Object.values(defaultSchemeTexts).join("\n\n")
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          setCurrentProject(data.project);
          project.schemeData = defaultSchemeTexts;
          project.schemeDocText = data.project.schemeDocText;
          project.updatedAt = data.project.updatedAt;
        }
      }
    } catch (err) {
      console.error("Failed to restore initial scheme:", err);
    }
  };

  const handleExportDocument = () => {
    const verLabel = isViewingInitial ? "V1.0.0 (绯荤粺鍐呯疆)" : "V1.0.1 (鐢ㄦ埛鑷畾涔?";
    const activeTexts = isViewingInitial ? defaultSchemeTexts : schemeTexts;

    const hospitalizationFieldRows = hospitalizationFieldsData
      .map(f => `
        <tr>
          <td>${f.field}</td>
          <td>${f.tag}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note.replace(/\n/g, "<br/>")}</td>
        </tr>
      `).join("");

    const examinationFieldRows = examinationFieldsData
      .map(f => `
        <tr>
          <td>${f.field}</td>
          <td>${f.tag}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note.replace(/\n/g, "<br/>")}</td>
        </tr>
      `).join("");

    const abdominalRows = abdominalFieldsData
      .map(f => `
        <tr>
          <td>${f.tag}</td>
          <td>${f.field}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note}</td>
        </tr>
      `).join("");

    const thoracicRows = thoracicFieldsData
      .map(f => `
        <tr>
          <td>${f.tag}</td>
          <td>${f.field}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note}</td>
        </tr>
      `).join("");

    const appendixHospitalizationFieldRows = appendixHospitalizationFieldsData
      .map(f => `
        <tr>
          <td>${f.field}</td>
          <td>${f.tag}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note.replace(/\n/g, "<br/>")}</td>
        </tr>
      `).join("");

    const appendixExaminationFieldRows = appendixExaminationFieldsData
      .map(f => `
        <tr>
          <td>${f.field}</td>
          <td>${f.tag}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note.replace(/\n/g, "<br/>")}</td>
        </tr>
      `).join("");

    const appendixThoracicRows = appendixThoracicFieldsData
      .map(f => `
        <tr>
          <td>${f.tag}</td>
          <td>${f.field}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note}</td>
        </tr>
      `).join("");

    const appendixAbdominalRows = appendixAbdominalFieldsData
      .map(f => `
        <tr>
          <td>${f.tag}</td>
          <td>${f.field}</td>
          <td>${f.attr}</td>
          <td><span style="color: #2563eb; font-weight: bold;">${f.tech}</span></td>
          <td>${f.note}</td>
        </tr>
      `).join("");

    const documentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: "Microsoft YaHei", SimSun, sans-serif; line-height: 1.6; color: #334155; padding: 20px; }
          h1 { font-family: "Microsoft YaHei", SimHei; text-align: center; color: #1e293b; font-size: 18pt; margin-top: 20px; margin-bottom: 25px; }
          h2 { font-family: "Microsoft YaHei", SimHei; color: #2563eb; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 35px; margin-bottom: 15px; font-size: 14pt; }
          h3 { font-family: "Microsoft YaHei", SimHei; color: #1d4ed8; margin-top: 20px; margin-bottom: 10px; font-size: 11pt; }
          p { margin-bottom: 12px; font-size: 10.5pt; text-align: justify; }
          li { font-size: 10.5pt; margin-bottom: 6px; }
          .meta-box { border: 1px solid #cbd5e1; padding: 15px; background-color: #f8fafc; margin-bottom: 30px; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; font-size: 10pt; }
          th { background-color: #f1f5f9; padding: 10px; text-align: left; font-weight: bold; border: 1px solid #cbd5e1; }
          td { padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
          .footer { text-align: center; margin-top: 60px; font-size: 9pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="meta-box">
          <p><strong>椤圭洰鍚嶇О锛?/strong> ${project.name}</p>
          <p><strong>鏂规绫诲瀷锛?/strong> 澶嶆棪澶у闄勫睘绗竴鍖婚櫌楠ㄧ涓村簥绉戠爺鏁版嵁闆嗗尶鍚嶅寲鏂规 (鐗堟湰: ${verLabel})</p>
          <p><strong>瀵嗙骇绛夌骇锛?/strong> 闄㈠唴鏈哄瘑 (Confidential)</p>
          <p><strong>鏈€鏂颁慨鏀规棩鏈燂細</strong> ${new Date(currentProject.updatedAt || currentProject.createdAt).toLocaleDateString()}</p>
        </div>
        <h1>銆婂鏃﹀ぇ瀛﹂檮灞炵涓€鍖婚櫌楠ㄧ涓村簥绉戠爺鏁版嵁闆嗗尶鍚嶅寲鏂规銆?/h1>
        
        <h2>1. 鍖垮悕鍖栧師鍒?/h2>
        <p>${(activeTexts.sec1 || "").replace(/\n/g, "<br/>")}</p>
        
        <h2>2. 鍙傝€冭鑼?/h2>
        <p>${(activeTexts.sec2 || "").replace(/\n/g, "<br/>")}</p>

        <h2>3. 鍦烘櫙璇存槑</h2>
        <p>${(activeTexts.sec3 || "").replace(/\n/g, "<br/>")}</p>

        <h2>4.闇€姹傚垎鏋?/h2>
        <h3>4.1 鏁版嵁浣跨敤闇€姹傚垎鏋?/h3>
        <p>${((activeTexts.sec4_1 || activeTexts.sec4 || defaultSchemeTexts.sec4_1) || "").replace(/\n/g, "<br/>")}</p>
        
        <h3>4.2 娴侀€氬満鏅垎鏋?/h3>
        <p>${((activeTexts.sec4_2 || defaultSchemeTexts.sec4_2) || "").replace(/\n/g, "<br/>")}</p>

        <h3>4.3 娴侀€氱幆澧冨垎鏋?/h3>
        <h4>4.3.1 鎶€鏈繚闅滆兘鍔?/h4>
        <table>
          <thead>
            <tr>
              <th style="width: 70%;">鎶€鏈帾鏂?/th>
              <th style="width: 30%;">鍏峰鎯呭喌</th>
            </tr>
          </thead>
          <tbody>
            ${techMeasuresData.map(item => `
              <tr>
                <td>${item.measure}</td>
                <td style="text-align: center;">${item.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h4>4.3.2 绠＄悊淇濋殰鑳藉姏</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">绠＄悊涓讳綋</th>
              <th style="width: 55%;">鎶€鏈帾鏂?/th>
              <th style="width: 20%;">鍏峰鎯呭喌</th>
            </tr>
          </thead>
          <tbody>
            ${mgmtMeasuresData.map((item, idx) => {
              const isFirstInGroup = idx === 0 || mgmtMeasuresData[idx - 1].subject !== item.subject;
              let groupCount = 1;
              if (isFirstInGroup) {
                for (let i = idx + 1; i < mgmtMeasuresData.length; i++) {
                  if (mgmtMeasuresData[i].subject === item.subject) groupCount++;
                  else break;
                }
              }
              return `
                <tr>
                  ${isFirstInGroup ? `<td rowspan="${groupCount}">${item.subject}</td>` : ''}
                  <td>${item.measure}</td>
                  <td style="text-align: center;">${item.status}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <h2>5. 鏁版嵁鑼冨洿</h2>
        <h3>5.1 鏁版嵁鏋勬垚</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 30%;">鏁版嵁绫诲埆</th>
              <th style="width: 70%;">鏁版嵁鍐呭</th>
            </tr>
          </thead>
          <tbody>
            ${dataCompositionData.map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${item.content}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h3>5.2 鏁版嵁灞炴€у垎绫?/h3>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">鏁版嵁灞炴€?/th>
              <th style="width: 20%;">鏁版嵁鍒嗙被</th>
              <th style="width: 25%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁鏍囩</th>
              <th style="width: 20%;">澶勭悊蹇呰鎬?/th>
            </tr>
          </thead>
          <tbody>
            ${dataAttributeSplittingData.map((item, idx) => {
              const isFirstGroup = idx === 0 || (
                dataAttributeSplittingData[idx - 1].attr !== item.attr || 
                dataAttributeSplittingData[idx - 1].necessity !== item.necessity
              );
              let groupCount = 1;
              if (isFirstGroup) {
                for (let i = idx + 1; i < dataAttributeSplittingData.length; i++) {
                  if (
                    dataAttributeSplittingData[i].attr === item.attr && 
                    dataAttributeSplittingData[i].necessity === item.necessity
                  ) {
                    groupCount++;
                  } else {
                    break;
                  }
                }
              }
              return `
                <tr>
                  ${isFirstGroup ? `<td rowspan="${groupCount}">${item.attr}</td>` : ''}
                  <td>${item.category}</td>
                  <td>${item.field}</td>
                  <td style="text-align: center;">${item.tag}</td>
                  ${isFirstGroup ? `<td rowspan="${groupCount}">${item.necessity}</td>` : ''}
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <h2>6. 澶勭悊鐩爣</h2>
        <p>${(activeTexts.sec6 || "").replace(/\n/g, "<br/>")}</p>

        <h2>7. 鍖垮悕鍖栧鐞嗘妧鏈鏄?/h2>
        <h3>7.1 缁撴瀯鍖栨枃鏈暟鎹尶鍚嶅寲</h3>
        <p>${(activeTexts.sec7_1 || "").replace(/\n/g, "<br/>")}</p>
        
        <h4>7.1.1 浣忛櫌淇℃伅</h4>
        <p>娑夊強浣跨敤鐨勬柟娉曞寘鎷細<br/>
灞炴€у垹闄わ細濡傝褰曞唴瀹逛腑鐨勬偅鑰呭鍚嶃€佸尰鐢熷鍚嶇瓑锛?br/>
鍋囧悕鍖栵細濡傛偅鑰呮爣璇嗗彿銆佸氨璇婂彿锛?br/>
娉涘寲锛氬璁板綍鍐呭涓殑骞撮緞绛夛紱<br/>
鎵板姩锛氬灏辫瘖鏃堕棿绛夈€備互涓嬪垪涓鹃儴鍒嗙粨鏋勫寲鏂囨湰鏁版嵁瀛楁鐨勫尶鍚嶅寲鎶€鏈柟娉曪細</p>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁鏍囩</th>
              <th style="width: 20%;">鏁版嵁灞炴€?/th>
              <th style="width: 15%;">鍖垮悕鍖栨妧鏈?/th>
              <th style="width: 30%;">璇存槑</th>
            </tr>
          </thead>
          <tbody>
            ${hospitalizationFieldRows}
          </tbody>
        </table>

        <h4>7.1.2 妫€鏌ヤ俊鎭?/h4>
        <p>娑夊強浣跨敤鐨勬柟娉曞寘鎷細<br/>
鍋囧悕鍖栵細濡傛偅鑰呮爣璇嗗彿銆佸氨璇婂彿锛?br/>
鎵板姩锛氬璁板綍鏃堕棿绛夈€備互涓嬪垪涓鹃儴鍒嗙粨鏋勫寲鏂囨湰鏁版嵁瀛楁鐨勫尶鍚嶅寲鎶€鏈柟娉曪細</p>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁鏍囩</th>
              <th style="width: 20%;">鏁版嵁灞炴€?/th>
              <th style="width: 15%;">鍖垮悕鍖栨妧鏈?/th>
              <th style="width: 30%;">璇存槑</th>
            </tr>
          </thead>
          <tbody>
            ${examinationFieldRows}
          </tbody>
        </table>
        
        <h3>7.2 褰卞儚鏁版嵁</h3>
        <p>${(activeTexts.sec7_2 || "").replace(/\n/g, "<br/>")}</p>
        
        <h4>7.2.1 鑵归儴</h4>
        <p>娑夊強浣跨敤鐨勬柟娉曞寘鎷細<br/>
灞炴€у垹闄わ細濡侷mplementation Class UID銆両mplementation Version Name绛夛紱<br/>
鍋囧悕鍖栵細濡侻edia Storage SOP Class UID銆丮edia Storage SOP Instance UID銆丼OP Instance UID绛夈€備互涓嬪垪涓綝ICOM鏁版嵁鏍囩鍖垮悕鍖栨妧鏈柟娉曪細</p>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">TAG</th>
              <th style="width: 25%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁灞炴€?/th>
              <th style="width: 15%;">鍖垮悕鍖栨妧鏈?/th>
              <th style="width: 25%;">璇存槑</th>
            </tr>
          </thead>
          <tbody>
            ${abdominalRows}
          </tbody>
        </table>

        <h4>7.2.2 鑳搁儴</h4>
        <p>娑夊強浣跨敤鐨勬柟娉曞寘鎷細<br/>
灞炴€у垹闄わ細濡係ource Application Entity Title绛夛紱<br/>
鍋囧悕鍖栵細濡侻edia Storage SOP Class UID銆丮edia Storage SOP Instance UID銆丼OP Instance UID绛夛紱<br/>
鎵板姩锛氬Study Date銆備互涓嬪垪涓綝ICOM鏁版嵁鏍囩鍖垮悕鍖栨妧鏈柟娉曪細</p>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">TAG</th>
              <th style="width: 25%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁灞炴€?/th>
              <th style="width: 15%;">鍖垮悕鍖栨妧鏈?/th>
              <th style="width: 25%;">璇存槑</th>
            </tr>
          </thead>
          <tbody>
            ${thoracicRows}
          </tbody>
        </table>

        <h3>7.3 鍥惧儚鏁版嵁</h3>
        <p>${(activeTexts.sec7_3 || "").replace(/\n/g, "<br/>")}</p>

        <h3>7.4 鐗规畩鍖垮悕鍖栬鏄?/h3>
        <p><strong>7.4.1 缁撴瀯鍖栨枃鏈笌DICOM褰卞儚鍏宠仈璇存槑</strong>锛?{(activeTexts.sec7_4_1 || "").replace(/\n/g, "<br/>")}</p>
        <p><strong>7.4.2 鎺掗櫎鈥滃墏閲忛〉搴忓垪鈥濆奖鍍忔枃浠?/strong>锛?{(activeTexts.sec7_4_2 || "").replace(/\n/g, "<br/>")}</p>
        <p><strong>7.4.3 鍖垮悕鍖栧奖鍍忎竴鑷存€ф牎楠?/strong>锛?{(activeTexts.sec7_4_4 || "").replace(/\n/g, "<br/>")}</p>

        <h3>7.5 鏁版嵁鏈€灏忓寲澶勭悊鏂规</h3>
        <p>a锛夋嫙鍒犻櫎灞炴€э紙涓庢祦閫氱洰鐨勬棤鍏筹級锛?br/>绉戝<br/>b锛夋渶灏忓寲鍒犻櫎鏃堕棿鐐癸細鍦ㄥ尶鍚嶅寲澶勭悊鏃跺畬鎴?/p>

        <h2>8. 闄勫綍</h2>

        <h3>8.1 缁撴瀯鍖栨枃鏈暟鎹?/h3>

        <h4>8.1.1 浣忛櫌淇℃伅</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁鏍囩</th>
              <th style="width: 20%;">鏁版嵁灞炴€?/th>
              <th style="width: 15%;">鍖垮悕鍖栨妧鏈?/th>
              <th style="width: 30%;">璇存槑</th>
            </tr>
          </thead>
          <tbody>
            ${appendixHospitalizationFieldRows}
          </tbody>
        </table>

        <h4>8.1.2 妫€鏌ヤ俊鎭?/h4>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁鏍囩</th>
              <th style="width: 20%;">鏁版嵁灞炴€?/th>
              <th style="width: 15%;">鍖垮悕鍖栨妧鏈?/th>
              <th style="width: 30%;">璇存槑</th>
            </tr>
          </thead>
          <tbody>
            ${appendixExaminationFieldRows}
          </tbody>
        </table>

        <h3>8.2 褰卞儚鏁版嵁</h3>

        <h4>8.2.1 鑵归儴</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">TAG</th>
              <th style="width: 25%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁灞炴€?/th>
              <th style="width: 15%;">鍖垮悕鍖栨妧鏈?/th>
              <th style="width: 25%;">璇存槑</th>
            </tr>
          </thead>
          <tbody>
            ${appendixAbdominalRows}
          </tbody>
        </table>

        <h4>8.2.2 鑳搁儴</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">TAG</th>
              <th style="width: 25%;">鏁版嵁瀛楁</th>
              <th style="width: 15%;">鏁版嵁灞炴€?/th>
              <th style="width: 15%;">鍖垮悕鍖栨妧鏈?/th>
              <th style="width: 25%;">璇存槑</th>
            </tr>
          </thead>
          <tbody>
            ${appendixThoracicRows}
          </tbody>
        </table>

        <div class="footer">
          姝ゆ柟妗堢敱 澶嶆棪澶у闄勫睘绗竴鍖婚櫌 鑱斿悎 鍖荤枟鍋ュ悍鏁版嵁鏅鸿兘鍖垮悕鍖栧钩鍙?瀹夊叏瀹℃牳缁勫叡鍚屽妗堟墽琛?        </div>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + documentHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `鍖荤枟鑴辨晱鏂规_${project.name.replace(/\s+/g, '_')}_${verLabel}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedTexts = isViewingInitial ? defaultSchemeTexts : schemeTexts;
  const isReadOnly = isViewingInitial || !isEditing;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="anonymization_scheme_view_root">
      
      {/* Header breadcrumbs - Styled exactly like AnonymizationScheme */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-slate-900 pb-5" id="scheme_header_navigation">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 border-2 border-slate-900 hover:bg-slate-100 rounded text-slate-950 transition-colors cursor-pointer"
            title="杩斿洖椤圭洰鍒楄〃"
            id="scheme_back_btn"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span>椤圭洰绠＄悊</span>
              <ChevronRight className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{project.name}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 font-bold">鍖垮悕鍖栨柟妗?/span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">鍖垮悕鍖栨柟妗?/h1>
          </div>
        </div>
      </div>

      {/* 2-Column layout: Sidebar TOC on left + Centered clean Paper-style Document Viewer on right */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 items-start" id="anonymization_scheme_main_layout">
        
        {/* Left Column: Outline / TOC */}
        <div className="lg:col-span-1 hidden lg:block sticky top-6">
          <div className="bg-white rounded-xl border-2 border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>鐩綍</span>
            </h3>
            <nav className="space-y-0.5 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
              {[
                { id: "sec_principles", label: "1. 鍖垮悕鍖栧師鍒?, level: 1 },
                { id: "sec_norms", label: "2. 鍙傝€冭鑼?, level: 1 },
                { id: "sec_scenarios", label: "3. 浣跨敤鍦烘櫙璇存槑", level: 1 },
                { id: "sec_requirements", label: "4. 闇€姹傚垎鏋?, level: 1 },
                { id: "sec_4_1", label: "4.1 鏁版嵁浣跨敤闇€姹傚垎鏋?, level: 2 },
                { id: "sec_4_2", label: "4.2 娴侀€氬満鏅垎鏋?, level: 2 },
                { id: "sec_4_3", label: "4.3 娴侀€氱幆澧冨垎鏋?, level: 2 },
                { id: "sec_4_3_1", label: "4.3.1 鎶€鏈繚闅滆兘鍔?, level: 3 },
                { id: "sec_4_3_2", label: "4.3.2 绠＄悊淇濋殰鑳藉姏", level: 3 },
                { id: "sec_scope", label: "5. 鏁版嵁鑼冨洿", level: 1 },
                { id: "sec_5_1", label: "5.1 鏁版嵁鏋勬垚", level: 2 },
                { id: "sec_5_2", label: "5.2 鏁版嵁灞炴€у垎绫?, level: 2 },
                { id: "sec_targets", label: "6. 澶勭悊鐩爣", level: 1 },
                { id: "sec_anonym_tech", label: "7. 鍖垮悕鍖栧鐞嗘妧鏈?, level: 1 },
                { id: "sec_text_anonym", label: "7.1 缁撴瀯鍖栨枃鏈暟鎹?, level: 2 },
                { id: "sec_7_1_1", label: "7.1.1 浣忛櫌淇℃伅", level: 3 },
                { id: "sec_7_1_2", label: "7.1.2 妫€鏌ヤ俊鎭?, level: 3 },
                { id: "sec_dicom_anonym", label: "7.2 褰卞儚鏁版嵁", level: 2 },
                { id: "sec_7_2_1", label: "7.2.1 鑵归儴", level: 3 },
                { id: "sec_7_2_2", label: "7.2.2 鑳搁儴", level: 3 },
                { id: "sec_img_anonym", label: "7.3 鍥惧儚鏁版嵁", level: 2 },
                { id: "sec_special_anonym", label: "7.4 鐗规畩鍖垮悕鍖栬鏄?, level: 2 },
                { id: "sec_7_4_1", label: "7.4.1 缁撴瀯鍖栨枃鏈笌DICOM褰卞儚鍏宠仈璇存槑", level: 3 },
                { id: "sec_7_4_2", label: "7.4.2 鎺掗櫎鈥滃墏閲忛〉搴忓垪鈥濆奖鍍忔枃浠?, level: 3 },
                { id: "sec_7_4_3", label: "7.4.3 鍖垮悕鍖栧奖鍍忎竴鑷存€ф牎楠?, level: 3 },
                { id: "sec_minimal_delete", label: "7.5 鏁版嵁鏈€灏忓寲澶勭悊鏂规", level: 2 },
                { id: "sec_fields_list", label: "8. 闄勫綍", level: 1 },
                { id: "sec_8_1", label: "8.1 缁撴瀯鍖栨枃鏈暟鎹?, level: 2 },
                { id: "sec_8_1_1", label: "8.1.1 浣忛櫌淇℃伅", level: 3 },
                { id: "sec_8_1_2", label: "8.1.2 妫€鏌ヤ俊鎭?, level: 3 },
                { id: "sec_8_2", label: "8.2 褰卞儚鏁版嵁", level: 2 },
                { id: "sec_8_2_1", label: "8.2.1 鑵归儴", level: 3 },
                { id: "sec_8_2_2", label: "8.2.2 鑳搁儴", level: 3 },
              ].map(item => {
                const paddingLeft = item.level === 1 ? 'pl-2' : item.level === 2 ? 'pl-5' : 'pl-8';
                const fontWeight = item.level === 1 ? 'font-bold text-slate-800' : item.level === 2 ? 'font-semibold text-slate-700' : 'font-medium text-slate-500';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('bg-blue-50/50');
                        setTimeout(() => el.classList.remove('bg-blue-50/50'), 1500);
                      }
                    }}
                    className={`w-full text-left pr-2 py-1.5 text-[11px] ${paddingLeft} ${fontWeight} hover:text-blue-600 hover:bg-slate-50 rounded transition-all truncate block cursor-pointer`}
                    title={item.label}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Column: Paper-style Document Viewer */}
        <div className="lg:col-span-3 w-full">
          {isViewingInitial && (
            <div className="mb-6 bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-bold shadow-xs animate-fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <span>鎮ㄥ綋鍓嶆鍦ㄩ瑙堛€愬垵濮嬬増鍖垮悕鍖栨柟妗堛€戯紝涓嶆敮鎸佺紪杈戯紝鎮ㄥ彲浠ュ鍑烘鐗堟湰锛屾垨灏嗘柟妗堟仮澶嶈嚦鍒濆鐗堝唴瀹广€?/span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleRestoreInitial}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black transition-all cursor-pointer flex items-center space-x-1 shadow-3xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>鎭㈠鍒濆鍐呭</span>
                </button>
                <button
                  onClick={() => setIsViewingInitial(false)}
                  className="py-1.5 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded text-[10px] font-black transition-all cursor-pointer shadow-3xs"
                >
                  杩斿洖鏈€鏂扮増
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-8 md:p-12 relative overflow-hidden" id="scheme_paper_document">
              
              {/* Watermark/Seal effect on top-right */}
              <div className="absolute top-6 right-6 opacity-10 select-none pointer-events-none transform rotate-12 hidden sm:block">
                <Shield className="w-32 h-32 text-blue-900" />
              </div>

              {/* Document Header Metadata with action buttons to the right */}
              <div className="border-b-2 border-slate-100 pb-6 mb-8 text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    銆婂鏃﹀ぇ瀛﹂檮灞炵涓€鍖婚櫌楠ㄧ涓村簥绉戠爺鏁版嵁闆嗗尶鍚嶅寲鏂规銆?                  </h2>
                  {!isEditing && (
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500">鍒涘缓鏃堕棿</span>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-0.5">
                          <span className="text-slate-800 font-black text-xs">
                            {project.createdAt ? project.createdAt : "-"}
                          </span>
                          {!isViewingInitial ? (
                            <button
                              type="button"
                              onClick={() => setIsViewingInitial(true)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center space-x-1 text-[11px] font-bold"
                              title="鏌ョ湅绯荤粺鍐呯疆鐨勫垵濮嬪悎瑙勮劚鏁忔柟妗?
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>鏌ョ湅鍒濆鐗堟柟妗?/span>
                            </button>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse">
                              姝ｅ湪鏌ョ湅鍒濆鐗?                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500">鏇存柊鏃堕棿</span>
                        <span className="text-slate-950 block mt-0.5 font-black text-xs font-mono">
                          {currentProject.updatedAt ? currentProject.updatedAt : "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Moved Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:mb-1">
                  {!isEditing ? (
                    <>
                      {onRegenerate && (
                        <button
                          onClick={() => setShowRegenerateAlert(true)}
                          className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border-2 border-slate-900 px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          id="regenerate_scheme_btn"
                        >
                          <RefreshCw className="w-4 h-4 text-blue-600" />
                          <span>閲嶆柊鐢熸垚鏂规</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleExportDocument()}
                        className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-950 text-white border-2 border-slate-900 px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        id="export_active_scheme_btn"
                      >
                        <Download className="w-4 h-4" />
                        <span>瀵煎嚭鏂规鏂囨。 (.doc)</span>
                      </button>

                      {!isViewingInitial && (
                        <button
                          onClick={handleStartEditing}
                          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                          id="edit_active_scheme_btn"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>缂栬緫</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveEditing}
                        className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        id="save_active_scheme_btn"
                      >
                        <Save className="w-4 h-4 text-white" />
                        <span>淇濆瓨</span>
                      </button>

                      <button
                        onClick={handleCancelEditing}
                        className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                        id="cancel_active_scheme_btn"
                      >
                        <X className="w-4 h-4" />
                        <span>鍙栨秷</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <DefaultRequirementLayout 
                schemeTexts={displayedTexts} 
                onChangeText={onChangeText} 
                readOnly={isReadOnly}
                projectName={project.name}
                isGlobalEditing={isGlobalEditing}
                techMeasures={techMeasures}
                setTechMeasures={setTechMeasures}
                mgmtMeasures={mgmtMeasures}
                setMgmtMeasures={setMgmtMeasures}
                dataComposition={dataComposition}
                setDataComposition={setDataComposition}
                dataAttributeSplittingData={dataAttributeSplittingData}
                hospitalization711Fields={hospitalization711Fields}
                examination712Fields={examination712Fields}
                abdominal721Fields={abdominal721Fields}
                thoracic722Fields={thoracic722Fields}
                minimizedFields={minimizedFields}
                appendixHospitalization={appendixHospitalization}
                setAppendixHospitalization={setAppendixHospitalization}
                appendixExamination={appendixExamination}
                setAppendixExamination={setAppendixExamination}
                appendixThoracic={appendixThoracic}
                setAppendixThoracic={setAppendixThoracic}
                appendixAbdominal={appendixAbdominal}
                setAppendixAbdominal={setAppendixAbdominal}
              />

          </div>
        </div>
      </div>

      {showRegenerateAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-slate-900 rounded-xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-200 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-900">鎻愮ず璇存槑</h3>
                <p className="text-xs text-slate-600 font-bold leading-relaxed mt-2">
                  鐢变簬鍘熷瀷鐨勬暟鎹棶棰橈紝姝ゆ寜閽笉鍋氫氦浜掍粎鍋氳鏄庯紝鍏蜂綋璇存槑璇﹁PRD瀵瑰簲鍐呭
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenerateAlert(false)}
                className="bg-slate-900 hover:bg-slate-950 text-white border-2 border-slate-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                纭畾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
