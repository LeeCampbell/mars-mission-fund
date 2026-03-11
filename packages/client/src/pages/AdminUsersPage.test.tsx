import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminUsersPage } from './AdminUsersPage'

vi.mock('../hooks/useUsers', () => ({
  useUsers: vi.fn(),
}))

import { useUsers } from '../hooks/useUsers'

const mockUsers = [
  { id: '1', email: 'admin@example.com', displayName: 'Admin User', bio: null, roles: ['admin'] },
  { id: '2', email: 'alice@example.com', displayName: 'Alice', bio: null, roles: ['user'] },
]

describe('AdminUsersPage', () => {
  it('renders user list with emails and display names', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUsers>)

    render(<AdminUsersPage />)

    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders role badges for each user', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUsers>)

    render(<AdminUsersPage />)

    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('user')).toBeInTheDocument()
  })

  it('shows loading state while fetching', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useUsers>)

    render(<AdminUsersPage />)

    expect(screen.getByText('Loading users…')).toBeInTheDocument()
  })

  it('shows error state on fetch failure', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useUsers>)

    render(<AdminUsersPage />)

    expect(screen.getByText('Failed to load users. Please try again.')).toBeInTheDocument()
  })
})
