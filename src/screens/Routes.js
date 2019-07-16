import analytics from '@segment/analytics-react-native';
import { get } from 'lodash';
import React from 'react';
import {
  createAppContainer,
  createMaterialTopTabNavigator,
} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Navigation from '../navigation';
import { updateTransitionProps } from '../redux/navigation';
import store from '../redux/store';
import { deviceUtils } from '../utils';
import ExpandedAssetScreenWithData from './ExpandedAssetScreenWithData';
import ImportSeedPhraseSheetWithData from './ImportSeedPhraseSheetWithData';
import ProfileScreenWithData from './ProfileScreenWithData';
import QRScannerScreenWithData from './QRScannerScreenWithData';
import ReceiveModal from './ReceiveModal';
import WalletConnectConfirmationModal from './WalletConnectConfirmationModal';
import SendSheetWithData from './SendSheetWithData';
import SettingsModal from './SettingsModal';
import TransactionConfirmationScreenWithData from './TransactionConfirmationScreenWithData';
import WalletScreen from './WalletScreen';
import {
  expandStyleInterpolator,
  sheetStyleInterpolator,
  backgroundStyleInterpolator,
} from '../navigation/transitions/effects';

const onTransitionEnd = () => {
  store.dispatch(updateTransitionProps({ isTransitioning: false }));
};

const onTransitionStart = () => {
  store.dispatch(updateTransitionProps({ isTransitioning: true }));
};

const SwipeStack = createMaterialTopTabNavigator({
  ProfileScreen: {
    name: 'ProfileScreen',
    screen: ProfileScreenWithData,
  },
  WalletScreen: {
    name: 'WalletScreen',
    screen: WalletScreen,
  },
  // eslint-disable-next-line sort-keys
  QRScannerScreen: {
    name: 'QRScannerScreen',
    screen: QRScannerScreenWithData,
  },
}, {
  headerMode: 'none',
  initialRouteName: 'WalletScreen',
  mode: 'modal',
  tabBarComponent: null,
});

const MainNavigator = createStackNavigator({
  ConfirmRequest: TransactionConfirmationScreenWithData,
  ExpandedAssetScreen: {
    navigationOptions: {
      cardStyleInterpolator: expandStyleInterpolator,
      cardTransparent: true,
      effect: 'expanded',
      gestureResponseDistance: {
        vertical: deviceUtils.dimensions.height,
      },
    },
    screen: ExpandedAssetScreenWithData,
  },
  ImportSeedPhraseSheet: ImportSeedPhraseSheetWithData,
  ReceiveModal: {
    navigationOptions: {
      cardTransparent: true,
      effect: 'expanded',
      gestureResponseDistance: {
        vertical: deviceUtils.dimensions.height,
      },
    },
    screen: ReceiveModal,
  },
  SendSheet: {
    navigationOptions: {
      cardStyleInterpolator: sheetStyleInterpolator,
    },
    screen: SendSheetWithData,
  },
  SettingsModal: {
    navigationOptions: {
      cardTransparent: true,
      effect: 'expanded',
      gesturesEnabled: false,
    },
    screen: SettingsModal,
  },
  SwipeLayout: {
    navigationOptions: {
      cardStyleInterpolator: backgroundStyleInterpolator,
    },
    screen: SwipeStack,
  },
  WalletConnectConfirmationModal: {
    navigationOptions: {
      cardStyleInterpolator: expandStyleInterpolator,
      cardTransparent: true,
      effect: 'expanded',
      gestureResponseDistance: {
        vertical: deviceUtils.dimensions.height,
      },
      transitionSpec: expandedTransitionSpec,
    },
    screen: WalletConnectConfirmationModal,
  },
}, {
  defaultNavigationOptions: {
    onTransitionEnd,
    onTransitionStart,
  },
  headerMode: 'none',
  initialRouteName: 'SwipeLayout',
  mode: 'modal',
});

const AppContainer = createAppContainer(MainNavigator);

const AppContainerWithAnalytics = () => (
  <AppContainer
    onNavigationStateChange={(prevState, currentState, action) => {
      const { params, routeName } = Navigation.getActiveRoute(currentState);
      const prevRouteName = Navigation.getActiveRouteName(prevState);

      if (routeName === 'SettingsModal') {
        let subRoute = get(params, 'section.title');
        if (subRoute === 'Settings') subRoute = null;
        return analytics.screen(`${routeName}${subRoute ? `>${subRoute}` : ''}`);
      }

      if (routeName !== prevRouteName) {
        let paramsToTrack = null;

        if (routeName === 'ExpandedAssetScreen') {
          const { asset, type } = params;
          paramsToTrack = {
            assetContractAddress: asset.address || get(asset, 'asset_contract.address'),
            assetName: asset.name,
            assetSymbol: asset.symbol || get(asset, 'asset_contract.symbol'),
            assetType: type,
          };
        }

        analytics.screen(routeName, paramsToTrack);
      }
    }}
  />
);

export default React.memo(AppContainerWithAnalytics);
