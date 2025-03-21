import {memo, useEffect, useState, type ReactElement} from 'react';
import styled, {css} from '@emotion/native';
import StatsChart, {StatsChartType} from './StatsChart';
import {StyleProp, View, ViewStyle} from 'react-native';
import {
  DoobooGithubStats,
  StatType,
  TierType,
} from '../../../types/github-stats';
import Score, {ScoreType} from './Score';
import {DEFAULT_GITHUB_STATS} from '../../../utils/constants';
import CombatDetails from './CombatDetails';

const Container = styled.View`
  flex-direction: column;
  align-items: center;
`;

const Scouter = ({
  githubLogin,
  doobooStats,
  chartType,
  style,
}: {
  githubLogin?: string | null;
  doobooStats: DoobooGithubStats;
  chartType?: Omit<
    StatsChartType,
    'statsScore' | 'onPressStat' | 'selectedStat'
  >;
  style?: StyleProp<ViewStyle>;
}): ReactElement => {
  const [width, setWidth] = useState(0);
  const [selectedStat, setSelectedStat] = useState<StatType | null>(null);
  const [tierName, setTierName] = useState<ScoreType['tierName']>('Silver');
  const pluginStats = !githubLogin
    ? DEFAULT_GITHUB_STATS.pluginStats
    : doobooStats.pluginStats;

  const sum =
    +pluginStats.earth.score +
    +pluginStats.fire.score +
    +pluginStats.gold.score +
    +pluginStats.people.score +
    +pluginStats.tree.score +
    +pluginStats.water.score;

  const score = Math.round((sum * 100) / 6);

  useEffect(() => {
    if (githubLogin && doobooStats.plugin.json) {
      const tierJSONArray: TierType[] = JSON.parse(
        JSON.stringify(doobooStats.plugin.json),
      );

      const tiers = tierJSONArray.filter((el) => el.score <= score);
      if (tiers.length === 0) {
        setTierName('Iron');

        return;
      }

      setTierName(tiers[tiers.length - 1].tier as ScoreType['tierName']);
    }
  }, [doobooStats.plugin.json, githubLogin, score]);

  const onPressStat = (stat: StatType | null): void => {
    setSelectedStat(stat);
  };

  return (
    <Container
      style={style}
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width);
      }}
    >
      <StatsChart
        width={width > 330 ? 330 : width - 64}
        selectedStat={selectedStat}
        onPressStat={onPressStat}
        statsScore={{
          tree: pluginStats.tree.score,
          fire: pluginStats.fire.score,
          earth: pluginStats.earth.score,
          gold: pluginStats.gold.score,
          water: pluginStats.water.score,
          people: pluginStats.people.score,
        }}
        {...chartType}
      />
      {githubLogin ? (
        <View
          style={css`
            flex: 1;
            align-self: stretch;
          `}
        >
          <View style={{height: 8}} />
          <Score score={score} tierName={tierName} />
          <View style={{height: 36}} />
          <CombatDetails
            selectedStat={selectedStat || null}
            onPressStat={onPressStat}
            pluginStats={pluginStats}
            json={doobooStats.json}
          />
        </View>
      ) : null}

      <View style={{height: 40}} />
    </Container>
  );
};

export default memo(Scouter);
