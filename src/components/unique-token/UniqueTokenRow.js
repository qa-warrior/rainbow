import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import WalletTypes from '../../helpers/walletTypes';
import { useWallets } from '../../hooks';
import Routes from '../../screens/Routes/routesNames';
import { position } from '../../styles';
import { deviceUtils, isNewValueForPath } from '../../utils';
import { Row } from '../layout';
import UniqueTokenCard from './UniqueTokenCard';

const CardMargin = 15;
const RowPadding = 19;
const CardSize =
  (deviceUtils.dimensions.width - RowPadding * 2 - CardMargin) / 2;

const sx = StyleSheet.create({
  container: {
    marginBottom: CardMargin,
    marginTop: 0,
    paddingHorizontal: RowPadding,
    width: '100%',
  },
});

const arePropsEqual = (...props) =>
  !isNewValueForPath(...props, 'item.uniqueId');

// eslint-disable-next-line react/display-name
const UniqueTokenRow = React.memo(({ item }) => {
  const { selected: selectedWallet = {} } = useWallets();
  const { navigate } = useNavigation();

  const handleItemPress = useCallback(
    asset =>
      navigate(Routes.EXPANDED_ASSET_SCREEN, {
        asset,
        isReadOnlyWallet: selectedWallet.type === WalletTypes.readOnly,
        type: 'unique_token',
      }),
    [navigate, selectedWallet.type]
  );

  return (
    <Row align="center" style={sx.container}>
      {item.map((uniqueToken, itemIndex) => (
        <UniqueTokenCard
          {...position.sizeAsObject(CardSize)}
          item={uniqueToken}
          key={uniqueToken.uniqueId}
          onPress={handleItemPress}
          style={{ marginLeft: itemIndex >= 1 ? CardMargin : 0 }}
        />
      ))}
    </Row>
  );
}, arePropsEqual);

UniqueTokenRow.propTypes = {
  item: PropTypes.array,
};

UniqueTokenRow.height = CardSize + CardMargin;
UniqueTokenRow.cardSize = CardSize;
UniqueTokenRow.cardMargin = CardMargin;
UniqueTokenRow.rowPadding = RowPadding;

export default UniqueTokenRow;
