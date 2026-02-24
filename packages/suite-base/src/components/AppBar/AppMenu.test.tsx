/** @jest-environment jsdom */

// SPDX-FileCopyrightText: Copyright (C) 2023-2026 Bayerische Motoren Werke Aktiengesellschaft (BMW AG)<lichtblick@bmwgroup.com>
// SPDX-License-Identifier: MPL-2.0

import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { useTranslation } from "react-i18next";

import { AppMenuProps } from "@lichtblick/suite-base/components/AppBar/types";
import { usePlayerSelection } from "@lichtblick/suite-base/context/PlayerSelectionContext";
import { useWorkspaceStore } from "@lichtblick/suite-base/context/Workspace/WorkspaceContext";
import { useWorkspaceActions } from "@lichtblick/suite-base/context/Workspace/useWorkspaceActions";
import { useLayoutTransfer } from "@lichtblick/suite-base/hooks/useLayoutTransfer";

import { AppMenu } from "./AppMenu";

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

jest.mock("@lichtblick/suite-base/context/PlayerSelectionContext", () => ({
  usePlayerSelection: jest.fn(),
}));

jest.mock("@lichtblick/suite-base/context/Workspace/WorkspaceContext", () => ({
  useWorkspaceStore: jest.fn(),
}));

jest.mock("@lichtblick/suite-base/context/Workspace/useWorkspaceActions", () => ({
  useWorkspaceActions: jest.fn(),
}));

jest.mock("@lichtblick/suite-base/hooks/useLayoutTransfer", () => ({
  useLayoutTransfer: jest.fn(),
}));

describe("AppMenu", () => {
  const mockHandleClose = jest.fn();
  const mockDialogActions = {
    dataSource: { open: jest.fn() },
    openFile: { open: jest.fn() },
    preferences: { open: jest.fn() },
  };
  const mockSidebarActions = {
    left: { setOpen: jest.fn() },
    right: { setOpen: jest.fn() },
  };
  const mockImportLayout = jest.fn();
  const mockExportLayout = jest.fn();
  const mockSelectRecent = jest.fn();

  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });

    (usePlayerSelection as jest.Mock).mockReturnValue({
      recentSources: [{ id: "1", title: "Recent Source 1" }],
      selectRecent: mockSelectRecent,
    });

    (useWorkspaceStore as jest.Mock).mockImplementation((selector) =>
      selector({
        sidebars: { left: { open: false }, right: { open: true } },
      }),
    );

    (useWorkspaceActions as jest.Mock).mockReturnValue({
      sidebarActions: mockSidebarActions,
      dialogActions: mockDialogActions,
    });

    (useLayoutTransfer as jest.Mock).mockReturnValue({
      importLayout: mockImportLayout,
      exportLayout: mockExportLayout,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderAppMenu = (props: Partial<AppMenuProps> = {}) =>
    render(<AppMenu open={true} handleClose={mockHandleClose} disablePortal={false} {...props} />);

  it("renders the menu with File and View sections", () => {
    renderAppMenu();

    expect(screen.getByText("file")).toBeInTheDocument();
    expect(screen.getByText("view")).toBeInTheDocument();
  });

  it("handles File menu actions", () => {
    renderAppMenu();

    fireEvent.pointerEnter(screen.getByText("file"));
    fireEvent.click(screen.getByText("open"));

    expect(mockDialogActions.dataSource.open).toHaveBeenCalledWith("start");
    expect(mockHandleClose).toHaveBeenCalled();
  });

  it("handles View menu actions", () => {
    renderAppMenu();

    fireEvent.pointerEnter(screen.getByText("view"));
    fireEvent.click(screen.getByText("showLeftSidebar"));

    expect(mockSidebarActions.left.setOpen).toHaveBeenCalledWith(true);
    expect(mockHandleClose).toHaveBeenCalled();
  });

});
