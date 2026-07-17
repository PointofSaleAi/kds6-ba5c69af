import { useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Index from './Index';
import {
  BOARD_TO_ROUTE,
  BOARD_ROUTE_SLUGS,
  buildBoardConfig,
  readTicketStudioConfig,
  writeTicketStudioConfig,
  type TicketStudioBoardId,
} from '@/lib/ticket-studio-config';
import {
  getCardVariantForTicketsRoute,
  writeStoredTicketsRoute,
} from '@/lib/ticket-card-variant';

const BoardRoute = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const isValid = boardId && (BOARD_ROUTE_SLUGS as string[]).includes(boardId);
  const board = isValid ? (boardId as TicketStudioBoardId) : null;

  const variant = useMemo(() => {
    if (!board) return 'v2' as const;
    return getCardVariantForTicketsRoute(BOARD_TO_ROUTE[board]);
  }, [board]);

  useEffect(() => {
    if (!board) return;
    const current = readTicketStudioConfig();
    const next = buildBoardConfig(board, current);
    writeTicketStudioConfig(next);
    writeStoredTicketsRoute(BOARD_TO_ROUTE[board]);
  }, [board]);

  if (!isValid) return <Navigate to="/kds/v3" replace />;
  return <Index cardVariant={variant} />;
};

export default BoardRoute;
