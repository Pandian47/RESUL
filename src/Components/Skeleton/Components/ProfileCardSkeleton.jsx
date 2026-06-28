import { scolor1 } from './constants';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
const ProfileCardSkeleton = () => (
  <div
    style={{
      position: 'relative',
      // borderRadius: 14,
      height: '193px',
      width: '100%',
      maxWidth: '100%',
      padding: '19px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      // border: '1px solid #ffffff',
      // borderLeft: 'none',
      borderRadius: 'var(--globalBorderRadius)',
    }}
   className='box-design'
  >
    {/* Background */}
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      borderRadius: 10,
      overflow: 'hidden',
    }} />

    {/* Content */}
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', marginTop: '47px' }}>
      {/* User Icon Skeleton */}
      <Skeleton
        circle
        width={50}
        height={50}
        style={{ marginRight: 14, marginTop: 2 }}
        baseColor={scolor1}

      />

      <div style={{ flex: 1 }}>
        {/* Label */}
        <Skeleton
          width={48}
          height={13}
          style={{ marginBottom: 6 }}
          baseColor={scolor1} />
        {/* Number */}
        <Skeleton
          width={75}
          height={15}
          style={{ marginBottom: 6 }}
          baseColor={scolor1}

        />
      </div>
    </div>

    {/* Bottom row */}
    <div style={{
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'space-between',
      marginTop: 28,
    }}>
      {/* Completeness text skeleton */}
      <Skeleton
        width={120}
        height={16}
        className='mt5'
        baseColor={scolor1}
      />
      {/* Info icon skeleton */}
      <Skeleton
        circle
        width={22}
        height={22}
        style={{ marginLeft: 8 }}
        baseColor={scolor1}

      />
    </div>
  </div>
);

export default ProfileCardSkeleton; 