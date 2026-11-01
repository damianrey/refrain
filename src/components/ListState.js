import React from "react";
import {
  ActionButton,
  GridContainer,
  SkeletonItem,
  StateMessage,
} from "../styles/LayoutStyle";

const SKELETON_ITEMS = 12;

// Decide entre placeholder, erro, lista vazia ou o conteúdo já carregado
const ListState = ({ status, isEmpty, emptyMessage, onRetry, children }) => {
  if (status === "error") {
    return (
      <StateMessage role="alert">
        <p>Não foi possível carregar seus dados do Spotify.</p>
        <ActionButton type="button" onClick={onRetry}>
          Tentar novamente
        </ActionButton>
      </StateMessage>
    );
  }

  if (isEmpty && status === "loading") {
    return (
      <GridContainer role="status" aria-label="Carregando">
        {Array.from({ length: SKELETON_ITEMS }, (_, index) => (
          <SkeletonItem key={index} />
        ))}
      </GridContainer>
    );
  }

  if (isEmpty) {
    return (
      <StateMessage>
        <p>{emptyMessage}</p>
      </StateMessage>
    );
  }

  return children;
};

export default ListState;
