import { includes, upperFirst } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { onlyUpdateForPropTypes } from 'recompact';
import TransactionStatusTypes from '../../helpers/transactionStatusTypes';
import TransactionTypes from '../../helpers/transactionTypes';
import { colors, position } from '../../styles';
import Spinner from '../Spinner';
import Icon from '../icons/Icon';
import { Row } from '../layout';
import { Text } from '../text';

const StatusProps = {
  [TransactionStatusTypes.approved]: {
    marginRight: 4,
    name: 'dot',
  },
  [TransactionStatusTypes.deposited]: {
    name: 'sunflower',
    style: { fontSize: 11, left: -1.3, marginBottom: 1.5, marginRight: 1 },
  },
  [TransactionStatusTypes.depositing]: {
    marginRight: 4,
  },
  [TransactionStatusTypes.approving]: {
    marginRight: 4,
  },
  [TransactionStatusTypes.swapping]: {
    marginRight: 4,
  },
  [TransactionStatusTypes.failed]: {
    marginRight: 4,
    name: 'closeCircled',
    style: position.maxSizeAsObject(12),
  },
  [TransactionStatusTypes.purchased]: {
    marginRight: 2,
    name: 'arrow',
  },
  [TransactionStatusTypes.purchasing]: {
    marginRight: 4,
  },
  [TransactionStatusTypes.received]: {
    marginRight: 2,
    name: 'arrow',
  },
  [TransactionStatusTypes.self]: {
    marginRight: 4,
    name: 'dot',
  },
  [TransactionStatusTypes.sending]: {
    marginRight: 4,
  },
  [TransactionStatusTypes.sent]: {
    marginRight: 3,
    name: 'sendSmall',
  },
  [TransactionStatusTypes.swapped]: {
    marginRight: 3,
    name: 'swap',
    small: true,
    style: position.maxSizeAsObject(12),
  },
  [TransactionStatusTypes.swapping]: {
    marginRight: 4,
  },
  [TransactionStatusTypes.withdrawing]: {
    marginRight: 4,
  },
  [TransactionStatusTypes.withdrew]: {
    name: 'sunflower',
    style: { fontSize: 11, left: -1.3, marginBottom: 1.5, marginRight: 1 },
  },
};

const getCustomDisplayStatus = status => {
  switch (status) {
    case TransactionStatusTypes.deposited:
    case TransactionStatusTypes.withdrew:
      return 'Savings';
    default:
      return upperFirst(status);
  }
};

const TransactionStatusBadge = ({ pending, status, type, ...props }) => {
  const isSwapping = status === TransactionStatusTypes.swapping;
  const isTrade = type === TransactionTypes.trade;

  let statusColor = colors.alpha(colors.blueGreyDark, 0.7);
  if (pending) {
    if (isSwapping) {
      statusColor = colors.swapPurple;
    } else {
      statusColor = colors.appleBlue;
    }
  } else if (isTrade && status === TransactionStatusTypes.sent) {
    statusColor = colors.swapPurple;
  }

  const displayStatus =
    isTrade && status === TransactionStatusTypes.sent
      ? TransactionStatusTypes.swapped
      : status;

  return (
    <Row align="center" {...props}>
      {pending && (
        <Spinner
          color={isSwapping ? colors.swapPurple : colors.appleBlue}
          size={12}
        />
      )}
      {displayStatus && includes(Object.keys(StatusProps), displayStatus) && (
        <Icon
          color={statusColor}
          style={position.maxSizeAsObject(10)}
          {...StatusProps[displayStatus]}
        />
      )}
      <Text color={statusColor} size="smedium" weight="semibold">
        {getCustomDisplayStatus(displayStatus)}
      </Text>
    </Row>
  );
};

TransactionStatusBadge.propTypes = {
  pending: PropTypes.bool,
  status: PropTypes.oneOf(Object.values(TransactionStatusTypes)),
  type: PropTypes.oneOf(Object.values(TransactionTypes)),
};

TransactionStatusBadge.defaultProps = {
  status: TransactionStatusTypes.error,
};

export default onlyUpdateForPropTypes(TransactionStatusBadge);
