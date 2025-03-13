import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {css} from '@emotion/native';
import {Stack} from 'expo-router';
import {t} from '../../src/STRINGS';

const styles = {
  container: css`
    padding: 20px;
    background-color: #f8f9fa;
  `,
  section: css`
    margin-bottom: 20px;
  `,
  title: css`
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  `,
  content: css`
    font-size: 16px;
    line-height: 24px;
    white-space: pre-wrap;
  `,
};

function PrivacyPolicy(): JSX.Element {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{title: t('common.privacyPolicy')}} />
      <View style={styles.section}>
        <Text style={styles.title}>제 1 조 (개인정보 수집 및 이용 동의)</Text>
        <Text style={styles.content}>
          크로스플랫폼 코리아 커뮤니티는 정보통신망이용촉진 및 정보보호 등에
          관한 법률, 개인정보 보호법 등에 따라 회원님의 개인정보를 보호하고 이와
          관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과
          같이 개인정보 취급방침을 수립·공개합니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>
          제 2 조 (개인정보의 수집 항목 및 수집 방법)
        </Text>
        <Text style={styles.content}>
          1. 회사는 회원가입, 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른
          요금정산, 기타 서비스 제공을 위해 회원가입 당시 아래와 같은 개인정보를
          수집하고 있습니다.
          {'\n\n'}
          1) 회원 가입 및 관리
          {'\n'}- 필수항목 : 로그인ID, 비밀번호, 이메일주소, 닉네임, 전문분야
          {'\n\n'}
          2) 인터넷 서비스 이용과정에서 아래 개인정보 항목이 자동으로 생성되어
          수집될 수 있습니다.
          {'\n'}- IP주소, 기기고유번호, 서비스 이용기록, 방문 기록, 불량 이용
          기록 등{'\n\n'}
          2. 개인정보의 수집 방법
          {'\n'}
          어플리케이션(회원가입), 고객센터를 통한 유선 상담, 이메일을 통한
          온라인 상담
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>제 3 조 (개인정보의 수집 및 이용목적)</Text>
        <Text style={styles.content}>
          회사는 다음과 같이 회원님의 개인정보를 수집합니다. 처리하고 있는
          개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
          변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등
          필요한 조치를 이행할 예정입니다. 이하에서는 홈페이지나 어플리케이션을
          이하 ‘서비스’라 합니다.
          {'\n\n'}
          개인정보의 수집·이용 목적 : 회원 가입 및 관리 재화 또는 서비스 제공
          {'\n\n'}
          수집하는 개인정보의 항목 : 로그인ID, 비밀번호, 이메일주소, 닉네임,
          전문분야, 사진, 휴대전화 번호, IP주소, 기기고유번호, 서비스 이용기록,
          방문 기록, 불량 이용 기록 등 성명, 주소, 신용카드번호, 은행계좌정보 등
          결제정보
          {'\n\n'}
          개인정보의보유·이용 기간 : 사업자/단체 서비스 탈퇴시까지, 재화·서비스
          공급완료 및 요금결제·정산 완료시까지
          {'\n\n'}
          다만, 법령에서 정한 기간이 있는 경우에는 해당 기간 종료시까지
          {'\n\n'}
          1) 전자상거래 등에서의 소비자 보호에 관한 법률
          {'\n'}- 표시·광고에 관한 기록 : 6개월
          {'\n'}- 계약 또는 청약철회, 대금결제, 재화 등의 공급에 관한 기록 : 5년
          {'\n'}- 소비자 불만 또는 분쟁처리에 관한 기록 : 3년
          {'\n\n'}
          2) 통신비밀보호법
          {'\n'}- 인터넷 로그기록자료 : 3개월
          {'\n\n'}
          3) 전자금융거래법
          {'\n'}- 전자금융 거래에 관한 기록 : 5년
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>
          제 4 조 (회원님의 권리·의무 및 행사방법)
        </Text>
        <Text style={styles.content}>
          회원님 및 법정 대리인은 담당자(부서명 : 운영팀, 담당자 장효찬, 연락처
          : E) crossplatformkorea@gmail.com )에게 언제든지 등록되어 있는 자신
          혹은 당해 만 14세 미만 아동의 개인정보를 조회하거나 수정, 가입해지를
          요청할 수 있습니다.
          {'\n\n'}
          회원님 및 법정대리인의 개인정보 조회, 수정은 회사의
          개인정보관리책임자에게 서면, 전화, 전자우편등을 통하여 하실 수 있으며
          회사는 이에 대해 지체없이 조치하겠습니다.
          {'\n\n'}
          회원님께서 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을
          완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다. 또한
          잘못된 개인정보를 제3 자에게 이미 제공한 경우에는 정정 처리결과를
          제3자에게 지체 없이 통지하여 정정이 이루어지도록 하겠습니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>
          제 5 조 (개인정보 자동수집장치의 설치/운영 및 거부에 관한 사항)
        </Text>
        <Text style={styles.content}>
          회사는 회원님의 쿠키를 수집하지 않습니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>제 6 조 (개인정보의 파기)</Text>
        <Text style={styles.content}>
          1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
          불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
          {'\n\n'}
          2. 회원님으로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이
          달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야
          하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나
          보관장소를 달리하여 보존합니다.
          {'\n\n'}
          3. 개인정보 파기의 절차 및 방법은 다음과 같습니다.
          {'\n\n'}
          1) 파기절차
          {'\n'}- 회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보
          보호책임자의 승인을 받아 개인정보를 파기합니다.
          {'\n\n'}
          2) 파기방법
          {'\n'}- 회사는 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할
          수 없도록 로우레밸포멧(Low Level Format) 등의 방법을 이용하여
          파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나
          소각하여 파기합니다.
          {'\n\n'}
          4. 개인정보 파기 요청 방법은 다음과 같습니다.
          {'\n'}- 담당자(부서명 : 운영팀, 담당자 : 장효찬, 연락처 : E)
          crossplatformkorea@gmail.com)에게 언제든지 개인정보 파기를 요청할 수
          있습니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>제 7 조 (개인 데이터의 파기)</Text>
        <Text style={styles.content}>
          개인 데이터 파기 요청 방법은 다음과 같습니다.
          {'\n\n'}- 담당자(부서명 : 운영팀, 담당자 : 장효찬, 연락처 : E)
          crossplatformkorea@gmail.com)에게 언제든지 개인 데이터 파기를 요청할
          수 있습니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>제 8 조 (개인정보의 안전성 확보조치)</Text>
        <Text style={styles.content}>
          회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고
          있습니다.
          {'\n\n'}
          가. 관리적 조치 : 내부관리계획 수립·시행, 정기적 직원 교육 등{'\n'}
          나. 기술적 조치 : 개인정보처리시스템 등의 접근권한 관리,
          접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치
          {'\n'}
          다. 물리적 조치 : 전산실, 자료보관실 등의 접근통제
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>제 9 조 (개인정보 보호책임자)</Text>
        <Text style={styles.content}>
          1. 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
          처리와 관련한 고객님의 불만처리 및 피해구제 등을 위하여 아래와 같이
          개인정보 보호책임자를 지정하고 있습니다.
          {'\n\n'}
          개인정보 보호책임자
          {'\n'}- 성명 : 장효찬
          {'\n'}- 소속 : 운영팀
          {'\n'}- 이메일 : crossplatformkorea@gmail.com
          {'\n\n'}
          2. 회원님께서는 회사의 서비스(또는 사업)을 이용하시면서 발생한 모든
          개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보
          보호책임자 및 담당부서로 문의하실 수 있습니다. 회사는 회원님의 문의에
          대해 지체없이 답변 및 처리해드릴 것입니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>제 10 조 (권익침해 구제방법)</Text>
        <Text style={styles.content}>
          회원님은 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을
          문의하실 수 있습니다.
          {'\n\n'}
          아래의 기관은 회사와는 별개의 기관으로서, 회사의 자체적인 개인정보
          불만처리, 피해구제 결과에 만족하지 못하시거나 보다 자세한 도움이
          필요하시면 문의하여 주시기 바랍니다.
          {'\n\n'}
          개인정보 침해신고센터 (한국인터넷진흥원 운영)
          {'\n'}- 소관업무 : 개인정보 침해사실 신고, 상담 신청
          {'\n'}- 홈페이지 : privacy.kisa.or.kr
          {'\n'}- 전화 : (국번없이) 118
          {'\n'}- 주소 : (138-950) 서울시 송파구 중대로 135 한국인터넷진흥원
          개인정보침해신고센터
          {'\n\n'}
          개인정보 분쟁조정위원회 (한국인터넷진흥원 운영)
          {'\n'}- 소관업무 : 개인정보 분쟁조정신청, 집단분쟁조정 (민사적 해결)
          {'\n'}- 홈페이지 : privacy.kisa.or.kr
          {'\n'}- 전화 : (국번없이) 118
          {'\n'}- 주소 : (138-950) 서울시 송파구 중대로 135 한국인터넷진흥원
          개인정보침해신고센터
          {'\n\n'}
          대검찰청 사이버범죄수사단 : 02-3480-3573 (www.spo.go.kr)
          {'\n'}
          경찰청 사이버테러대응센터 : 1566-0112 (www.netan.go.kr)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>제 11 조 (개인정보 취급방침 변경)</Text>
        <Text style={styles.content}>
          1. 현 개인정보취급방침 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소
          7일전부터 홈페이지의 '공지사항'을 통해 고지할 것입니다. 다만,
          개인정보의 수집 및 활용, 제3자 제공 등과 같이 이용자 권리의 중요한
          변경이 있을 경우에는 최소 30일 전에 고지합니다.
          {'\n\n'}
          2. 이 개인정보 취급방침은 2021. 8월 6일부터 적용되며, 이전의 개인정보
          취급방침은 아래에서 확인하실 수 있습니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>
          제 12 조 (아동 보호 및 성적 학대 방지 정책)
        </Text>
        <Text style={styles.content}>
          회사는 아동 성적 학대 및 착취(CSAE)를 엄격히 금지하며, 관련 콘텐츠
          또는 행위를 발견하는 즉시 삭제 및 신고 조치를 취합니다.
          {'\n\n'}
          1. 금지 사항:
          {'\n'}- 아동 성적 학대 및 착취를 조장하거나 포함하는 콘텐츠의 제작,
          배포, 공유
          {'\n'}- 미성년자에 대한 부적절한 접근, 착취 또는 협박 행위
          {'\n'}- 아동 보호법 및 기타 관련 법률 위반 행위
          {'\n\n'}
          2. 신고 절차:
          {'\n'}- 회사는 사용자가 아동 보호 관련 위반 사항을 신고할 수 있도록
          지원합니다.
          {'\n'}- 신고 접수 이메일: crossplatformkorea@gmail.com
          {'\n'}- 관련 기관 신고: 한국인터넷진흥원 (privacy.kisa.or.kr / 118),
          경찰청 사이버수사국 (cyberbureau.police.go.kr)
          {'\n\n'}
          3. 조치 사항:
          {'\n'}- 신고된 콘텐츠 및 계정은 즉시 검토되며, 필요한 경우 계정 정지
          및 법적 조치를 취합니다.
          {'\n'}- CSAE 관련 위반 행위가 발견될 경우, 즉시 법적 기관에
          신고합니다.
          {'\n\n'}
          회사는 아동 보호 및 이용자의 안전을 최우선으로 하며, 관련 법규 및 구글
          정책을 철저히 준수합니다.
        </Text>
      </View>

      <View
        style={css`
          height: 40px;
        `}
      />
    </ScrollView>
  );
}

export default PrivacyPolicy;
