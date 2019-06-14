import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Scrollbars } from 'react-custom-scrollbars';

export const Wrapper = styled('div')`
  position: relative;
`;

export const Scroll = styled(Scrollbars)`
  width: 100%;
`;

export const Inner = styled('div')`
  display: flex;
  margin: 0 -6px;
  position: relative;
`;

export const Item = styled('div')`
  flex-shrink: 0;
  padding: 0 6px 16px;
`;

export const Shade = styled('div')`
  z-index: 1;
  position: absolute;
  top: 0;
  ${p => p.position}: 0;
  bottom: 16px;
  width: ${p => p.reach}px;
  ${p => `
    background: linear-gradient(
      to ${(p.position === 'left' ? 'right' : 'left')},
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  `}
  opacity: ${p => (p.visible ? 1 : 0)};
  visibility: ${p => (p.visible ? 'visible' : 'hidden')};

  transition: opacity .2s ease-in-out, visibility .2s ease-in-out;
  will-change: opacity, visibility;
`;


export default null;
