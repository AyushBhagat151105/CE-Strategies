import { HugeiconsIcon, type HugeiconsProps, type IconSvgElement } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Alert02Icon,
  FlameIcon,
  Location01Icon,
  RadioIcon,
  ShieldAlertIcon,
  SparklesIcon,
  UserGroupIcon,
  CompassIcon,
  ArrowUpRight01Icon,
  ChevronRightIcon,
  ChevronLeftIcon,
  RefreshIcon,
  Cancel01Icon,
  Clock01Icon,
  Layers01Icon,
  Loading03Icon,
  ShieldCheckIcon,
  Database01Icon,
  HeartHandshakeIcon,
  Megaphone02Icon,
  BellOffIcon,
  Activity01Icon,
  CheckmarkCircle02Icon,
  CircleArrowUp01Icon,
  SentIcon,
  CancelCircleIcon,
  Search01Icon,
  SlidersHorizontalIcon,
  ZoomInIcon,
  ZoomOutIcon,
  InformationCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GlobeIcon,
} from "@hugeicons-pro/core-stroke-sharp";

type IconComponentProps = Omit<HugeiconsProps, "icon">;

function createIcon(icon: IconSvgElement) {
  return function Icon(props: IconComponentProps) {
    return <HugeiconsIcon icon={icon} {...props} />;
  };
}

export const AlertCircle = createIcon(AlertCircleIcon);
export const AlertTriangle = createIcon(Alert02Icon);
export const Flame = createIcon(FlameIcon);
export const MapPin = createIcon(Location01Icon);
export const Radio = createIcon(RadioIcon);
export const ShieldAlert = createIcon(ShieldAlertIcon);
export const Sparkles = createIcon(SparklesIcon);
export const Users = createIcon(UserGroupIcon);
export const Compass = createIcon(CompassIcon);
export const ExternalLink = createIcon(ArrowUpRight01Icon);
export const ChevronRight = createIcon(ChevronRightIcon);
export const ChevronLeft = createIcon(ChevronLeftIcon);
export const RefreshCw = createIcon(RefreshIcon);
export const X = createIcon(Cancel01Icon);
export const Clock = createIcon(Clock01Icon);
export const Layers = createIcon(Layers01Icon);
export const Loader2 = createIcon(Loading03Icon);
export const RotateCcw = createIcon(RefreshIcon);
export const ShieldCheck = createIcon(ShieldCheckIcon);
export const Database = createIcon(Database01Icon);
export const HeartHandshake = createIcon(HeartHandshakeIcon);
export const Megaphone = createIcon(Megaphone02Icon);
export const BellOff = createIcon(BellOffIcon);
export const Activity = createIcon(Activity01Icon);
export const CheckCircle2 = createIcon(CheckmarkCircle02Icon);
export const ArrowUpCircle = createIcon(CircleArrowUp01Icon);
export const Send = createIcon(SentIcon);
export const XCircle = createIcon(CancelCircleIcon);
export const Search = createIcon(Search01Icon);
export const SlidersHorizontal = createIcon(SlidersHorizontalIcon);
export const ZoomIn = createIcon(ZoomInIcon);
export const ZoomOut = createIcon(ZoomOutIcon);
export const Info = createIcon(InformationCircleIcon);
export const Check = createIcon(CheckIcon);
export const ChevronDown = createIcon(ChevronDownIcon);
export const ChevronUp = createIcon(ChevronUpIcon);
export const Globe = createIcon(GlobeIcon);
