import { FunctionComponent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ROUTES from '../utils/routes'
import Badge from './Badge'
import DistributeAidLogo from './branding/DistributeAidLogo'
import DropdownMenu from './DropdownMenu'
import CogIcon from './icons/CogIcon'
import TruckIcon from './icons/TruckIcon'
import UserIcon from './icons/UserIcon'
import DesktopNavigation from './navigation/DesktopNavigation'
import MobileNavigation from './navigation/MobileNavigation'

export interface NavLinkItem {
  path: string
  label: ReactNode
  icon?: ReactNode
  adminOnly?: boolean
}

const NAV_LINKS: NavLinkItem[] = [
  {
    path: ROUTES.SHIPMENT_LIST,
    label: 'Shipments',
    icon: <TruckIcon className="w-5 h-5 mr-2" />,
  },
  {
    path: ROUTES.ADMIN_ROOT,
    label: 'Admin',
    icon: <CogIcon className="w-5 h-5 mr-2" />,
    adminOnly: true,
  },
]

interface Props {
  /**
   * If true, the user's information and "log out" button will be hidden.
   * Use this prop when you want to show the page header while things are
   * still loading.
   */
  hideControls?: boolean
}

/**
 * A full-width element that sits at the top of the page. It displays the DA
 * branding and a dropdown-menu with some account information.
 */
const TopNavigation: FunctionComponent<Props> = ({ hideControls }) => {
  const { logout, me: profile } = useAuth()

  const userIsAdmin = profile?.isAdmin

  const filteredNavLinks = NAV_LINKS.filter((link) =>
    link.adminOnly ? userIsAdmin : true,
  )

  return (
    <header className="py-2 bg-navy-800 h-nav sticky top-0 z-20">
      <div className="max-w-5xl px-4 mx-auto h-full flex items-center justify-between">
        <MobileNavigation navLinks={filteredNavLinks} />
        <div className="flex items-center">
          <Link to="/" className="text-white" aria-label="Go to the home page">
            <DistributeAidLogo className="block h-8" />
          </Link>
        </div>
        <DesktopNavigation navLinks={filteredNavLinks} />
        {!hideControls && profile && (
          <div className="flex items-center text-white">
            <DropdownMenu
              buttonVariant="primary"
              position="right"
              label={<UserIcon className="w-6 h-6" />}
            >
              <DropdownMenu.Text>
                <div>
                  {profile.name}
                  {userIsAdmin && <Badge className="ml-4">Admin</Badge>}
                </div>
              </DropdownMenu.Text>
              <DropdownMenu.Divider />
              <DropdownMenu.Button onClick={() => logout()}>
                Log out
              </DropdownMenu.Button>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}

export default TopNavigation
