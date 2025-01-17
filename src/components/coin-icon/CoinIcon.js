import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import ReactCoinIcon, { FallbackIcon } from 'react-coin-icon';
import FastImage from 'react-native-fast-image';
import ShadowStack from 'react-native-shadow-stack';
import { onlyUpdateForKeys } from 'recompact';
import styled, { css } from 'styled-components/primitives';
import { toChecksumAddress } from '../../handlers/web3';
import { borders, colors, fonts } from '../../styles';
import { Icon } from '../icons';

const CoinIconSize = 40;

const fallbackTextStyles = css`
  font-family: ${fonts.family.SFProRounded};
  letter-spacing: ${fonts.letterSpacing.roundedTight};
  margin-bottom: 1;
  text-align: center;
`;

const IndicatorIcon = styled.View`
  align-items: center;
  background-color: ${colors.blueGreyDark50};
  border-radius: 10;
  bottom: 3;
  height: 20;
  justify-content: center;
  left: 10;
  position: absolute;
  shadow-color: ${colors.blueGreyDark};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.4;
  shadow-radius: 6;
  width: 20;
  z-index: 10;
`;

const CoinIconFallback = fallbackProps => {
  const { height, width, address, symbol } = fallbackProps;
  const [remoteIconUrl, setRemoteIconUrl] = useState(null);
  const [iconNotAvailable, setIconNotAvailable] = useState(false);
  const loadRemoteIcon = useCallback(async () => {
    if (address) {
      const checksummedAddress = toChecksumAddress(address);
      const potentialIconUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksummedAddress}/logo.png`;
      if (potentialIconUrl !== remoteIconUrl) {
        setRemoteIconUrl(potentialIconUrl);
      }
    }
  }, [address, remoteIconUrl]);

  if (!iconNotAvailable) {
    loadRemoteIcon();
  }

  if (iconNotAvailable) {
    return (
      <FallbackIcon
        {...fallbackProps}
        bgColor={colors.blueGreyDark}
        symbol={symbol || ''}
        textStyles={fallbackTextStyles}
      />
    );
  } else if (remoteIconUrl) {
    return (
      <FastImage
        {...fallbackProps}
        onError={() => {
          setIconNotAvailable(true);
        }}
        source={{ uri: remoteIconUrl }}
        style={{ height, width }}
      />
    );
  }
  return null;
};

const enhance = onlyUpdateForKeys([
  'bgColor',
  'symbol',
  'address',
  'isCoinListEdited',
  'isPinned',
  'isHidden',
]);
const CoinIcon = enhance(
  ({
    bgColor,
    showShadow,
    size,
    symbol,
    address,
    isPinned,
    isHidden,
    isCoinListEdited,
    ...props
  }) =>
    showShadow ? (
      <>
        {(isPinned || isHidden) && isCoinListEdited ? (
          <IndicatorIcon>
            <Icon
              color={colors.white}
              height={isPinned ? 13 : 10}
              marginTop={isPinned ? 1 : 0}
              name={isPinned ? 'pin' : 'hidden'}
              width={isPinned ? 8 : 14}
            />
          </IndicatorIcon>
        ) : null}
        <ShadowStack
          {...props}
          {...borders.buildCircleAsObject(size)}
          backgroundColor={bgColor}
          opacity={isHidden ? 0.4 : 1}
          shadows={[
            [0, 4, 6, colors.dark, 0.04],
            [0, 1, 3, colors.dark, 0.08],
          ]}
          shouldRasterizeIOS
        >
          <ReactCoinIcon
            address={address || ''}
            bgColor={bgColor}
            fallbackRenderer={CoinIconFallback}
            size={size}
            symbol={symbol || ''}
          />
        </ShadowStack>
      </>
    ) : (
      <ReactCoinIcon
        {...props}
        address={address || ''}
        bgColor={bgColor}
        fallbackRenderer={CoinIconFallback}
        size={size}
        symbol={symbol}
      />
    )
);

CoinIcon.propTypes = {
  address: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.string]),
  bgColor: PropTypes.string,
  showShadow: PropTypes.bool,
  size: PropTypes.number,
  symbol: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.string]),
};

CoinIcon.defaultProps = {
  showShadow: true,
  size: CoinIconSize,
};

CoinIcon.size = CoinIconSize;

export default CoinIcon;
