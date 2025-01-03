import {useCPK} from 'cpk-ui';
import {G, Path, Svg} from 'react-native-svg';

type Props = {
  color?: string;
};

export default function SvgStatsTree({color}: Props) {
  const {theme} = useCPK();
  const fill = color || theme.text.basic;

  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <G opacity="1.0">
        <Path d="M10 11.4285L14.2556 18.2539H5.74445L10 11.4285Z" fill={fill} />
        <Path
          d="M13.5841 13.7158C14.8052 12.9372 15.7396 11.7821 16.2459 10.4253C16.7522 9.06845 16.8028 7.58365 16.3903 6.19545C15.9777 4.80724 15.1243 3.59114 13.9592 2.73104C12.794 1.87095 11.3805 1.41366 9.93236 1.42832C8.48421 1.44298 7.08023 1.92881 5.93274 2.81232C4.78525 3.69583 3.95666 4.92896 3.57229 6.32524C3.18792 7.72151 3.26867 9.20498 3.80233 10.5513C4.336 11.8976 5.29354 13.0335 6.53016 13.7872L10.0794 8.09517L13.5841 13.7158Z"
          fill={fill}
        />
      </G>
    </Svg>
  );
}
