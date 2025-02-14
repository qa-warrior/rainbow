import React from 'react';
import { Text } from '../text';

const SheetTitle = props => (
  <Text
    align="center"
    letterSpacing="roundedMedium"
    lineHeight="loose"
    size="large"
    weight="bold"
    {...props}
  />
);

export default SheetTitle;
