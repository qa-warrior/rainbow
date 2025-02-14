import GraphemeSplitter from 'grapheme-splitter';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import ShadowStack from 'react-native-shadow-stack';
import styled from 'styled-components/primitives';
import { isAvatarPickerAvailable } from '../../config/experimental';
import {
  useAccountSettings,
  useCoinListEdited,
  useRequests,
} from '../../hooks';
import Routes from '../../screens/Routes/routesNames';
import { colors } from '../../styles';
import Avatar from '../Avatar';
import { OpacityToggler } from '../animations';
import { Badge } from '../badge';
import { Centered, InnerBorder } from '../layout';
import HeaderButton from './HeaderButton';

const AvatarCircle = styled(View)`
  border-radius: 17px;
  height: 34px;
  width: 34px;
  z-index: 10;
`;

const FirstLetter = styled(Text)`
  color: #fff;
  font-size: 23;
  font-weight: 400;
  letter-spacing: -0.6;
  line-height: 34;
  text-align: center;
  width: 100%;
`;

const ProfileHeaderButton = ({ navigation }) => {
  const { pendingRequestCount } = useRequests();
  const { isCoinListEdited } = useCoinListEdited();
  const { accountColor, accountName } = useAccountSettings();

  const onPress = useCallback(
    () => navigation.navigate(Routes.PROFILE_SCREEN),
    [navigation]
  );

  return (
    <OpacityToggler
      endingOpacity={0.4}
      isVisible={isCoinListEdited}
      startingOpacity={1}
    >
      <View pointerEvents={isCoinListEdited ? 'none' : 'auto'}>
        <HeaderButton
          testID="goToProfile"
          onPress={onPress}
          shouldRasterizeIOS
          transformOrigin="left"
        >
          <Centered>
            {isAvatarPickerAvailable ? (
              <ShadowStack
                backgroundColor={colors.avatarColor[accountColor]}
                borderRadius={65}
                height={34}
                width={34}
                shadows={[
                  [0, 2, 2.5, colors.dark, 0.08],
                  [0, 6, 5, colors.dark, 0.12],
                ]}
                shouldRasterizeIOS
              >
                <AvatarCircle
                  style={{ backgroundColor: colors.avatarColor[accountColor] }}
                >
                  <FirstLetter>
                    {new GraphemeSplitter().splitGraphemes(accountName)[0]}
                  </FirstLetter>
                  <InnerBorder opacity={0.04} radius={34} />
                </AvatarCircle>
              </ShadowStack>
            ) : (
              <Avatar size={34} />
            )}
            {pendingRequestCount > 0 && (
              <Badge delay={1500} value={pendingRequestCount} zIndex={1} />
            )}
          </Centered>
        </HeaderButton>
      </View>
    </OpacityToggler>
  );
};

ProfileHeaderButton.propTypes = {
  navigation: PropTypes.object,
};

export default ProfileHeaderButton;
