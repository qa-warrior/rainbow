import { ethers } from 'ethers';
import { get } from 'lodash';
import { toHex } from '../../handlers/web3';
import { convertAmountToRawAmount } from '../../helpers/utilities';
import { dataAddNewTransaction } from '../../redux/data';
import { rapsAddOrUpdate } from '../../redux/raps';
import store from '../../redux/store';
import {
  compoundCETHABI,
  compoundCERC20ABI,
  savingsAssetsListByUnderlying,
} from '../../references';
import { gasUtils } from '../../utils';

const NOOP = () => undefined;

const estimateWithdrawalGasLimit = async (
  compound,
  accountAddress,
  rawRedeemAmount
) => {
  try {
    console.log('[withdraw] estimating gas');
    const params = { from: accountAddress, value: toHex(0) };
    const gasLimit = await compound.estimate.redeem(rawRedeemAmount, params);
    console.log('[withdraw] estimated gas limit for withdraw', gasLimit);
    console.log(
      '[withdraw] TO STRING estimated gas limit for withdraw',
      gasLimit.toString()
    );
    return gasLimit ? gasLimit.toString() : null;
  } catch (error) {
    console.log('[withdraw] ERROR estimating gas', error);
    return null;
  }
};

// TODO
const withdrawCompound = async (wallet, currentRap, index, parameters) => {
  console.log('[withdraw]');
  const { inputAmount, inputCurrency, selectedGasPrice } = parameters;
  const { dispatch } = store;
  const { gasPrices } = store.getState().gas;
  const { accountAddress, network } = store.getState().settings;
  const rawInputAmount = convertAmountToRawAmount(
    inputAmount,
    inputCurrency.decimals
  );
  console.log('[withdraw] raw input amount', rawInputAmount);

  console.log('[withdraw] execute the withdraw');
  let gasPrice = get(selectedGasPrice, 'value.amount');
  if (!gasPrice) {
    gasPrice = get(gasPrices, `[${gasUtils.FAST}].value.amount`);
  }

  console.log('[withdraw] gas price', gasPrice);
  const cTokenContract =
    savingsAssetsListByUnderlying[network][inputCurrency.address]
      .contractAddress;

  const compound = new ethers.Contract(
    cTokenContract,
    inputCurrency.address === 'eth' ? compoundCETHABI : compoundCERC20ABI,
    wallet
  );

  const gasLimit = await estimateWithdrawalGasLimit(
    compound,
    accountAddress,
    rawInputAmount
  );

  const transactionParams = {
    gasLimit: gasLimit ? toHex(gasLimit) : undefined,
    gasPrice: gasPrice ? toHex(gasPrice) : undefined,
    value: toHex(0),
  };
  console.log('[withdraw] txn params', transactionParams);
  const withdraw = await compound.redeemUnderlying(
    rawInputAmount,
    transactionParams
  );
  console.log('[withdraw] redeemed - result', withdraw);

  currentRap.actions[index].transaction.hash = withdraw.hash;

  const newTransaction = {
    amount: inputAmount,
    asset: inputCurrency,
    from: accountAddress,
    hash: withdraw.hash,
    nonce: get(withdraw, 'nonce'),
    to: get(withdraw, 'to'),
  };

  console.log('[withdraw] adding new txn', newTransaction);
  dispatch(dataAddNewTransaction(newTransaction));

  console.log('[withdraw] calling the callback');
  currentRap.callback();
  currentRap.callback = NOOP;

  // wait for it to complete
  currentRap.actions[index].transaction.hash = withdraw.hash;
  try {
    console.log('[withdraw] waiting for the withdraw to go thru');
    await withdraw.wait();
    // update rap for confirmed status
    currentRap.actions[index].transaction.confirmed = true;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  } catch (error) {
    console.log('[withdraw] error waiting for withdraw', error);
    currentRap.actions[index].transaction.confirmed = false;
    dispatch(rapsAddOrUpdate(currentRap.id, currentRap));
  }
  console.log('[withdraw] complete!');
};

export default withdrawCompound;
