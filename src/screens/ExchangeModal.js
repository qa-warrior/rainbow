import analytics from '@segment/analytics-react-native';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Animated from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { compose, toClass } from 'recompact';
import { interpolate } from '../components/animations';
import {
  ConfirmExchangeButton,
  ExchangeInputField,
  ExchangeModalHeader,
  ExchangeOutputField,
  SlippageWarning,
} from '../components/exchange';
import SwapInfo from '../components/exchange/SwapInfo';
import { FloatingPanel, FloatingPanels } from '../components/expanded-state';
import { GasSpeedButton } from '../components/gas';
import { Centered, KeyboardFixedOpenLayout } from '../components/layout';
import ExchangeModalTypes from '../helpers/exchangeModalTypes';
import { withBlockedHorizontalSwipe } from '../hoc';
import {
  useAccountSettings,
  useBlockPolling,
  useGas,
  useMaxInputBalance,
  usePrevious,
  useSwapDetails,
  useSwapInputRefs,
  useSwapInputs,
  useUniswapCurrencies,
  useUniswapCurrencyReserves,
  useUniswapMarketDetails,
} from '../hooks';
import { loadWallet } from '../model/wallet';
import { executeRap } from '../raps/common';
import { savingsLoadState } from '../redux/savings';
import ethUnits from '../references/ethereum-units.json';
import { colors, padding, position } from '../styles';
import { backgroundTask, isNewValueForPath, logger } from '../utils';
import Routes from './Routes/routesNames';

export const exchangeModalBorderRadius = 30;

const AnimatedFloatingPanels = Animated.createAnimatedComponent(
  toClass(FloatingPanels)
);

const ExchangeModal = ({
  createRap,
  cTokenBalance,
  defaultInputAsset,
  estimateRap,
  inputHeaderTitle,
  navigation,
  showOutputField,
  supplyBalanceUnderlying,
  type,
  underlyingPrice,
}) => {
  const isDeposit = type === ExchangeModalTypes.deposit;
  const isWithdrawal = type === ExchangeModalTypes.withdrawal;

  const tabPosition = get(navigation, 'state.params.position');

  const defaultGasLimit = isDeposit
    ? ethUnits.basic_deposit
    : isWithdrawal
    ? ethUnits.basic_withdrawal
    : ethUnits.basic_swap;

  const dispatch = useDispatch();
  const {
    gasPricesStartPolling,
    gasPricesStopPolling,
    gasUpdateDefaultGasLimit,
    gasUpdateTxFee,
    isSufficientGas,
    selectedGasPrice,
  } = useGas();
  const {
    inputReserve,
    outputReserve,
    uniswapClearCurrenciesAndReserves,
  } = useUniswapCurrencyReserves();
  const { web3ListenerInit, web3ListenerStop } = useBlockPolling();
  const { nativeCurrency } = useAccountSettings();
  const prevSelectedGasPrice = usePrevious(selectedGasPrice);
  const { getMarketDetails } = useUniswapMarketDetails();
  const { maxInputBalance, updateMaxInputBalance } = useMaxInputBalance();

  const {
    areTradeDetailsValid,
    extraTradeDetails,
    updateExtraTradeDetails,
  } = useSwapDetails();

  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [slippage, setSlippage] = useState(null);

  const {
    defaultInputAddress,
    inputCurrency,
    navigateToSelectInputCurrency,
    navigateToSelectOutputCurrency,
    outputCurrency,
    previousInputCurrency,
  } = useUniswapCurrencies({
    defaultInputAsset,
    inputHeaderTitle,
    isDeposit,
    isWithdrawal,
    navigation,
    type,
    underlyingPrice,
  });

  const {
    assignInputFieldRef,
    assignNativeFieldRef,
    assignOutputFieldRef,
    handleFocus,
    inputFieldRef,
    nativeFieldRef,
    outputFieldRef,
  } = useSwapInputRefs({ inputCurrency, outputCurrency });

  const {
    inputAmount,
    inputAmountDisplay,
    inputAsExactAmount,
    isMax,
    isSufficientBalance,
    nativeAmount,
    outputAmount,
    outputAmountDisplay,
    setIsSufficientBalance,
    updateInputAmount,
    updateNativeAmount,
    updateOutputAmount,
  } = useSwapInputs({
    defaultInputAsset,
    inputCurrency,
    isDeposit,
    isWithdrawal,
    maxInputBalance,
    nativeFieldRef,
    outputCurrency,
    supplyBalanceUnderlying,
    type,
  });

  const updateGasLimit = useCallback(async () => {
    try {
      const gasLimit = await estimateRap({
        inputAmount,
        inputCurrency,
        inputReserve,
        outputAmount,
        outputCurrency,
        outputReserve,
      });
      dispatch(gasUpdateTxFee(gasLimit));
    } catch (error) {
      dispatch(gasUpdateTxFee(defaultGasLimit));
    }
  }, [
    defaultGasLimit,
    dispatch,
    estimateRap,
    gasUpdateTxFee,
    inputAmount,
    inputCurrency,
    inputReserve,
    outputAmount,
    outputCurrency,
    outputReserve,
  ]);

  // Update gas limit
  useEffect(() => {
    updateGasLimit();
  }, [updateGasLimit]);

  const clearForm = useCallback(() => {
    logger.log('[exchange] - clear form');
    if (inputFieldRef && inputFieldRef.current) inputFieldRef.current.clear();
    if (nativeFieldRef && nativeFieldRef.current)
      nativeFieldRef.current.clear();
    if (outputFieldRef && outputFieldRef.current)
      outputFieldRef.current.clear();
    updateInputAmount();
  }, [inputFieldRef, nativeFieldRef, outputFieldRef, updateInputAmount]);

  // Clear form and reset max input balance on new input currency
  useEffect(() => {
    if (isNewValueForPath(inputCurrency, previousInputCurrency, 'address')) {
      clearForm();
      updateMaxInputBalance(inputCurrency);
    }
  }, [clearForm, inputCurrency, previousInputCurrency, updateMaxInputBalance]);

  // Recalculate max input balance when gas price changes if input currency is ETH
  useEffect(() => {
    if (
      get(inputCurrency, 'address') === 'eth' &&
      get(prevSelectedGasPrice, 'txFee.value.amount', 0) !==
        get(selectedGasPrice, 'txFee.value.amount', 0)
    ) {
      updateMaxInputBalance(inputCurrency);
    }
  }, [
    inputCurrency,
    prevSelectedGasPrice,
    selectedGasPrice,
    updateMaxInputBalance,
  ]);

  // Liten to gas prices, Uniswap reserves updates
  useEffect(() => {
    dispatch(
      gasUpdateDefaultGasLimit(
        isDeposit
          ? ethUnits.basic_deposit
          : isWithdrawal
          ? ethUnits.basic_withdrawal
          : ethUnits.basic_swap
      )
    );
    dispatch(gasPricesStartPolling());
    dispatch(web3ListenerInit());
    return () => {
      dispatch(uniswapClearCurrenciesAndReserves());
      dispatch(gasPricesStopPolling());
      dispatch(web3ListenerStop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update input amount when max is set and the max input balance changed
  useEffect(() => {
    if (isMax) {
      let maxBalance = maxInputBalance;
      if (isWithdrawal) {
        maxBalance = supplyBalanceUnderlying;
      }
      updateInputAmount(maxBalance, maxBalance, true, true);
    }
  }, [
    maxInputBalance,
    isMax,
    isWithdrawal,
    supplyBalanceUnderlying,
    updateInputAmount,
  ]);

  // Calculate market details
  useEffect(() => {
    if (
      (isDeposit || isWithdrawal) &&
      get(inputCurrency, 'address') === defaultInputAddress
    )
      return;
    getMarketDetails({
      inputAmount,
      inputAsExactAmount,
      inputCurrency,
      inputFieldRef,
      maxInputBalance,
      nativeCurrency,
      outputAmount,
      outputCurrency,
      outputFieldRef,
      setIsSufficientBalance,
      setSlippage,
      updateExtraTradeDetails,
      updateInputAmount,
      updateOutputAmount,
    });
  }, [
    defaultInputAddress,
    getMarketDetails,
    inputAmount,
    inputAsExactAmount,
    inputCurrency,
    inputFieldRef,
    isDeposit,
    isWithdrawal,
    maxInputBalance,
    nativeCurrency,
    outputAmount,
    outputCurrency,
    outputFieldRef,
    setIsSufficientBalance,
    updateExtraTradeDetails,
    updateInputAmount,
    updateOutputAmount,
  ]);

  const handlePressMaxBalance = useCallback(async () => {
    let maxBalance = maxInputBalance;
    if (isWithdrawal) {
      maxBalance = supplyBalanceUnderlying;
    }
    analytics.track('Selected max balance', {
      category: isDeposit || isWithdrawal ? 'savings' : 'swap',
      defaultInputAsset: get(defaultInputAsset, 'symbol', ''),
      type,
      value: Number(maxBalance.toString()),
    });
    return updateInputAmount(maxBalance, maxBalance, true, true);
  }, [
    defaultInputAsset,
    isDeposit,
    isWithdrawal,
    maxInputBalance,
    supplyBalanceUnderlying,
    type,
    updateInputAmount,
  ]);

  const handleSubmit = useCallback(() => {
    backgroundTask.execute(async () => {
      analytics.track(`Submitted ${type}`, {
        category: isDeposit || isWithdrawal ? 'savings' : 'swap',
        defaultInputAsset: get(defaultInputAsset, 'symbol', ''),
        type,
      });

      setIsAuthorizing(true);
      try {
        const wallet = await loadWallet();

        setIsAuthorizing(false);
        const callback = () => {
          navigation.setParams({ focused: false });
          navigation.navigate(Routes.PROFILE_SCREEN);
        };
        const rap = await createRap({
          callback,
          inputAmount: isWithdrawal && isMax ? cTokenBalance : inputAmount,
          inputAsExactAmount,
          inputCurrency,
          inputReserve,
          isMax,
          outputAmount,
          outputCurrency,
          outputReserve,
          selectedGasPrice: null,
        });
        logger.log('[exchange - handle submit] rap', rap);
        await executeRap(wallet, rap);
        if (isDeposit || isWithdrawal) {
          dispatch(savingsLoadState());
        }
        logger.log('[exchange - handle submit] executed rap!');
        analytics.track(`Completed ${type}`, {
          category: isDeposit || isWithdrawal ? 'savings' : 'swap',
          defaultInputAsset: get(defaultInputAsset, 'symbol', ''),
          type,
        });
      } catch (error) {
        setIsAuthorizing(false);
        logger.log('[exchange - handle submit] error submitting swap', error);
        navigation.setParams({ focused: false });
        navigation.navigate(Routes.WALLET_SCREEN);
      }
    });
  }, [
    cTokenBalance,
    createRap,
    defaultInputAsset,
    dispatch,
    inputAmount,
    inputAsExactAmount,
    inputCurrency,
    inputReserve,
    isDeposit,
    isMax,
    isWithdrawal,
    navigation,
    outputAmount,
    outputCurrency,
    outputReserve,
    type,
  ]);

  const navigateToSwapDetailsModal = useCallback(() => {
    inputFieldRef.current.blur();
    outputFieldRef.current.blur();
    nativeFieldRef.current.blur();
    navigation.setParams({ focused: false });
    navigation.navigate(Routes.SWAP_DETAILS_SCREEN, {
      ...extraTradeDetails,
      inputCurrencySymbol: get(inputCurrency, 'symbol'),
      outputCurrencySymbol: get(outputCurrency, 'symbol'),
      restoreFocusOnSwapModal: () => {
        navigation.setParams({ focused: true });
      },
      type: 'swap_details',
    });
  }, [
    extraTradeDetails,
    inputCurrency,
    inputFieldRef,
    nativeFieldRef,
    navigation,
    outputCurrency,
    outputFieldRef,
  ]);

  const isSlippageWarningVisible =
    isSufficientBalance && !!inputAmount && !!outputAmount;

  const showDetailsButton = useMemo(() => {
    return (
      !(isDeposit || isWithdrawal) &&
      get(inputCurrency, 'symbol') &&
      get(outputCurrency, 'symbol') &&
      areTradeDetailsValid
    );
  }, [
    areTradeDetailsValid,
    inputCurrency,
    isDeposit,
    isWithdrawal,
    outputCurrency,
  ]);

  const showConfirmButton =
    isDeposit || isWithdrawal
      ? !!inputCurrency
      : !!inputCurrency && !!outputCurrency;

  return (
    <KeyboardFixedOpenLayout>
      <Centered
        {...position.sizeAsObject('100%')}
        backgroundColor={colors.transparent}
        direction="column"
      >
        <AnimatedFloatingPanels
          margin={0}
          style={{
            opacity: interpolate(tabPosition, {
              extrapolate: Animated.Extrapolate.CLAMP,
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          }}
        >
          <FloatingPanel
            radius={exchangeModalBorderRadius}
            overflow="visible"
            style={{ paddingBottom: showOutputField ? 0 : 26 }}
          >
            <ExchangeModalHeader
              onPressDetails={navigateToSwapDetailsModal}
              showDetailsButton={showDetailsButton}
              title={inputHeaderTitle}
            />
            <ExchangeInputField
              disableInputCurrencySelection={isWithdrawal}
              inputAmount={inputAmountDisplay}
              inputCurrencyAddress={get(inputCurrency, 'address', null)}
              inputCurrencySymbol={get(inputCurrency, 'symbol', null)}
              assignInputFieldRef={assignInputFieldRef}
              nativeAmount={nativeAmount}
              nativeCurrency={nativeCurrency}
              assignNativeFieldRef={assignNativeFieldRef}
              onFocus={handleFocus}
              onPressMaxBalance={handlePressMaxBalance}
              onPressSelectInputCurrency={navigateToSelectInputCurrency}
              setInputAmount={updateInputAmount}
              setNativeAmount={updateNativeAmount}
            />
            {showOutputField && (
              <ExchangeOutputField
                bottomRadius={exchangeModalBorderRadius}
                onFocus={handleFocus}
                onPressSelectOutputCurrency={navigateToSelectOutputCurrency}
                outputAmount={outputAmountDisplay}
                outputCurrencyAddress={get(outputCurrency, 'address', null)}
                outputCurrencySymbol={get(outputCurrency, 'symbol', null)}
                assignOutputFieldRef={assignOutputFieldRef}
                setOutputAmount={updateOutputAmount}
              />
            )}
          </FloatingPanel>
          {isDeposit && (
            <SwapInfo
              asset={outputCurrency}
              amount={(inputAmount > 0 && outputAmountDisplay) || null}
            />
          )}
          {isSlippageWarningVisible && <SlippageWarning slippage={slippage} />}
          {showConfirmButton && (
            <Fragment>
              <Centered css={padding(24, 15, 0)} flexShrink={0} width="100%">
                <ConfirmExchangeButton
                  disabled={!Number(inputAmountDisplay)}
                  isAuthorizing={isAuthorizing}
                  isDeposit={isDeposit}
                  isSufficientBalance={isSufficientBalance}
                  isSufficientGas={isSufficientGas}
                  onSubmit={handleSubmit}
                  slippage={slippage}
                  type={type}
                />
              </Centered>
              <GasSpeedButton type={type} />
            </Fragment>
          )}
        </AnimatedFloatingPanels>
      </Centered>
    </KeyboardFixedOpenLayout>
  );
};

ExchangeModal.propTypes = {
  createRap: PropTypes.func,
  cTokenBalance: PropTypes.string,
  defaultInputAddress: PropTypes.string,
  estimateRap: PropTypes.func,
  inputHeaderTitle: PropTypes.string,
  navigation: PropTypes.object,
  showOutputField: PropTypes.bool,
  supplyBalanceUnderlying: PropTypes.string,
  type: PropTypes.oneOf(Object.values(ExchangeModalTypes)),
  underlyingPrice: PropTypes.string,
};

export default compose(withBlockedHorizontalSwipe)(ExchangeModal);
