import PropTypes from 'prop-types';
import React, { createElement, Fragment } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/primitives';
import { useDimensions } from '../../hooks';
import { colors, padding, position } from '../../styles';
import ContextMenu from '../ContextMenu';
import Divider from '../Divider';
import { Row } from '../layout';
import { H1 } from '../text';

const ListHeaderHeight = 44;

const BackgroundGradient = styled(LinearGradient).attrs({
  colors: [
    colors.listHeaders.firstGradient,
    colors.listHeaders.secondGradient,
    colors.listHeaders.thirdGradient,
  ],
  end: { x: 0, y: 0 },
  pointerEvents: 'none',
  start: { x: 0, y: 0.5 },
})`
  ${position.cover};
`;

const Content = styled(Row).attrs({
  align: 'center',
  justify: 'space-between',
})`
  ${padding(0, 19, 2)};
  background-color: ${({ isSticky }) =>
    isSticky ? colors.white : colors.transparent};
  height: ${ListHeaderHeight};
  width: 100%;
`;

const StickyBackgroundBlocker = styled.View`
  background-color: ${colors.white};
  height: ${({ deviceDimensions }) => deviceDimensions.height + 100};
  top: ${({ isEditMode }) => (isEditMode ? -40 : 0)};
  width: ${({ deviceDimensions }) => deviceDimensions.width};
`;

const ListHeader = ({
  children,
  contextMenuOptions,
  isCoinListEdited,
  isSticky,
  showDivider,
  title,
  titleRenderer,
}) => {
  const deviceDimensions = useDimensions();

  return (
    <Fragment>
      <BackgroundGradient />
      <Content isSticky={isSticky}>
        <Row align="center">
          {createElement(titleRenderer, { children: title })}
          <ContextMenu marginTop={3} {...contextMenuOptions} />
        </Row>
        {children}
      </Content>
      {showDivider && <Divider />}
      {!isSticky && title !== 'Balances' && (
        <StickyBackgroundBlocker
          deviceDimensions={deviceDimensions}
          isEditMode={isCoinListEdited}
        />
      )}
    </Fragment>
  );
};

ListHeader.propTypes = {
  children: PropTypes.node,
  contextMenuOptions: PropTypes.object,
  isCoinListEdited: PropTypes.bool,
  isSticky: PropTypes.bool,
  showDivider: PropTypes.bool,
  title: PropTypes.string,
  titleRenderer: PropTypes.func,
};

ListHeader.defaultProps = {
  showDivider: true,
  titleRenderer: H1,
};

ListHeader.height = ListHeaderHeight;

export default ListHeader;
