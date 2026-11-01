import React from 'react';
import styled from 'styled-components';

const StyledHeader = styled.h1`
  font-size: 24px;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
`;

const Header = () => {
  return (
    <StyledHeader>Refrain</StyledHeader>
  );
};

export default Header;