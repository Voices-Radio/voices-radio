import Image from "next/image";

export default function VoicesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#632DFF] to-[#ED675D]" />

      <svg
        className="absolute -top-32 -right-48"
        width="523"
        height="828"
        viewBox="0 0 523 828"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M90.8904 568.16C95.9061 573.253 100.844 578.187 105.686 583.215C110.402 588.111 115.418 592.745 120.028 598.016C118.665 599.046 117.602 599.908 116.49 600.694C110.634 604.851 104.758 608.989 98.9019 613.155C97.7809 613.951 96.6695 614.775 95.7031 615.73C94.4565 616.966 94.4661 618.595 95.7708 619.709C97.0367 620.785 98.4767 621.694 99.8973 622.583C106.024 626.403 111.794 630.635 116.964 635.634C129.247 647.515 135.751 661.792 136.051 678.626C136.224 688.25 135.094 697.734 132.32 707.021C127.256 723.967 117.167 737.346 101.975 747.017C97.7326 749.723 93.2291 752.11 88.6387 754.217C79.4289 758.448 70.0354 762.296 60.7966 766.481C52.4082 770.282 44.0584 774.196 35.815 778.278C29.1661 781.573 23.3387 786.03 18.1974 791.291C8.68801 801.028 2.97657 812.628 0.260978 825.688C0.116017 826.4 0.0773273 827.139 1.49012e-05 827.804C1.15004 828.375 1.54626 827.561 2.03913 827.111C5.63415 823.816 9.16157 820.464 12.7856 817.206C18.584 811.991 24.856 807.394 31.9204 803.874C41.1689 799.268 50.9682 796.834 61.3668 797.171C69.9388 797.452 78.1629 799.493 86.0487 802.76C88.1748 803.64 90.2816 804.586 92.4077 805.484C105.184 810.858 118.559 812.684 132.311 811.12C148.102 809.323 161.902 802.966 173.837 792.789C178.263 789.016 182.196 784.794 185.724 780.234C192.392 771.612 199.021 762.942 205.661 754.291C208.057 751.164 210.512 748.084 212.831 744.901C222.476 731.682 235.368 722.45 250.531 716.009C265.626 709.596 281.427 706.516 297.914 707.312C310.554 707.929 322.625 710.897 333.893 716.627C343.325 721.43 352.767 726.223 362.209 731.007C376.521 738.254 391.703 741.587 407.852 740.248C417.458 739.452 426.716 737.102 435.597 733.46C465.768 721.083 488.634 700.936 503.999 672.896C512.233 657.86 518.157 641.991 521.056 625.167C522.815 614.962 523.318 604.682 522.815 594.309C522.226 582.016 520.699 569.855 518.698 557.731C515.848 540.364 511.344 523.446 503.478 507.511C489.126 478.441 467.025 456.552 437.781 441.339C430.156 437.369 422.493 433.474 414.955 429.374C409.021 426.144 403.329 422.53 398.439 417.868C393.22 412.896 388.688 407.438 385.74 400.884C380.454 389.125 381.923 378.125 389.79 367.873C392.206 364.727 395.105 362.05 398.207 359.559C401.3 357.078 404.402 354.588 407.32 351.92C413.959 345.862 418.212 338.578 419.023 329.628C419.545 323.889 418.801 318.272 417.062 312.785C414.385 304.313 409.823 296.954 403.242 290.775C398.613 286.431 393.278 283.247 387.18 281.244C380.87 279.165 374.337 278.023 367.814 276.816C359.928 275.355 352.042 273.866 344.175 272.35C340.977 271.732 337.913 270.721 335.043 269.204C321.764 262.154 318.131 248.691 319.667 238.449C320.75 231.268 323.523 224.602 326.799 218.133C328.442 214.893 329.805 211.607 330.568 208.04C332.076 201 330.897 194.334 327.853 187.921C323.949 179.701 317.59 173.774 309.163 169.973C301.567 166.547 293.681 164.047 285.36 162.764C281.717 162.203 278.102 161.276 274.604 160.143C260.784 155.668 251.033 146.82 245.119 133.957C242.394 128.03 240.712 121.804 239.688 115.438C237.929 104.503 236.247 93.549 234.778 82.5671C232.169 63.0186 224.728 45.5767 210.86 30.9997C197.05 16.4788 180.003 7.24757 160.23 2.72559C144.951 -0.7759 129.624 -1.01932 114.326 2.66942C97.0561 6.82627 83.4587 16.123 73.7464 30.5409C70.9728 34.6603 68.4988 39.0418 66.5467 43.5826C59.231 60.6032 55.4427 78.3821 54.7952 96.8352C53.9834 119.885 58.1873 142.102 65.7639 163.85C73.7657 186.825 82.9273 209.388 91.7119 232.083C97.7326 247.633 103.637 263.222 109.233 278.922C113.475 290.822 116.23 303.133 117.911 315.622C122.453 349.364 116.471 381.205 99.1532 410.911C95.6548 416.903 91.9245 422.764 88.3778 428.737C82.0478 439.391 76.2204 450.289 72.4321 462.067C70.9631 466.626 69.8904 471.307 68.6631 475.942C68.4312 476.803 68.2476 477.702 68.1992 478.591C68.0446 481.063 68.9724 482.186 71.485 482.608C72.3934 482.757 73.3212 482.823 74.2489 482.87C75.1767 482.917 76.1044 482.879 77.0322 482.889C97.433 483.029 117.834 483.169 138.235 483.31C139.472 483.31 140.718 483.282 141.936 483.432C144.825 483.787 146.343 485.313 146.594 488.141C146.691 489.171 146.613 490.238 146.478 491.268C144.671 504.515 139.52 516.405 130.474 526.517C123.497 534.315 116.23 541.89 108.953 549.436C103.26 555.343 97.3557 561.063 91.5669 566.877C91.364 567.074 91.2867 567.392 90.8808 568.151L90.8904 568.16ZM163.342 419.899C164.608 419.066 165.825 418.195 167.111 417.427C176.765 411.717 187.405 408.796 198.471 407.11C201.785 406.605 204.926 407.288 207.874 408.805C209.236 409.507 210.58 410.247 211.962 410.921C221.2 415.405 238.103 416.407 246.337 409.151C249.497 406.371 253.894 405.837 258.194 406.67C262.582 407.522 266.95 408.477 271.299 409.451C277.938 410.939 284.355 413.065 290.366 416.248C291.11 416.641 291.729 417.278 292.366 417.765C291.458 419.637 289.931 420.451 288.578 421.406C284.046 424.608 279.001 426.865 273.734 428.634C264.795 431.639 255.575 433.362 246.163 434.28C227.579 436.096 209.149 435.347 190.913 431.312C182.757 429.514 174.852 426.968 167.478 423.073C166.028 422.305 164.328 421.781 163.332 419.89L163.342 419.899Z"
          fill="#5F5CF3"
        />
      </svg>

      <svg
        className="absolute -bottom-24 -left-24"
        width="613"
        height="465"
        viewBox="0 0 613 465"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M608.955 464.964C611.68 459.157 612.615 453.569 612.876 447.994C613.966 424.756 607.912 403.814 593.045 385.909C586.091 377.528 577.834 370.822 568.179 365.915C554.851 359.149 541.002 357.703 526.763 361.906C520.046 363.886 513.518 366.547 506.991 369.146C498.674 372.45 490.251 375.268 481.39 376.665C463.656 379.471 446.656 377.03 430.39 369.365C426.268 367.421 422.299 365.125 418.366 362.805C405.05 354.922 395.845 343.357 390.301 328.781C388.311 323.557 386.866 318.103 385.42 312.673C383.3 304.668 385.029 297.295 389.46 290.505C392.126 286.435 395.49 283.034 399.127 279.888C400.833 278.418 402.74 277.155 404.233 274.908C398.073 269.223 391.154 264.825 384.816 259.274C387.209 256.201 390.408 254.452 393.168 252.192C395.976 249.896 398.866 247.722 402.053 245.232C401.034 244.26 400.371 243.373 399.494 242.827C392.22 238.272 384.899 233.789 377.637 229.222C376.772 228.675 375.363 228.444 375.54 226.513C383.229 224.412 391.308 223.756 399.471 221.569C399.388 219.953 399.494 218.423 399.198 216.99C395.348 197.724 386.629 181.325 371.832 168.546C358.943 157.419 344.028 150.617 327.715 146.815C315.288 143.924 302.648 142.94 289.984 142.15C276.941 141.336 263.909 140.389 251.068 137.741C236.674 134.765 224.638 127.464 214.568 116.605C207.602 109.085 201.963 100.57 197.272 91.4355C193.22 83.5398 189.619 75.3889 185.71 67.4082C181.469 58.735 177.417 49.9404 172.749 41.5102C159.434 17.4587 138.619 4.89843 112.379 0.841251C103.269 -0.56783 94.2535 -0.154809 85.2737 1.69157C68.2146 5.18998 54.5672 14.5069 43.3484 27.8203C31.6913 41.6561 24.1806 57.5689 21.3374 75.6683C20.0935 83.5883 20.4252 91.5448 21.3374 99.4891C21.989 105.077 22.7708 110.652 23.221 116.265C24.382 130.951 21.3256 144.847 15.189 158.051C13.3173 162.072 11.173 165.971 9.02875 169.858C5.36813 176.491 2.40639 183.39 1.00848 190.921C-0.4605 198.878 -0.531613 206.859 2.19312 214.499C9.25372 234.384 22.3326 247.528 43.0997 251.524C53.975 253.613 64.3881 256.99 74.2919 261.995C75.9859 262.858 77.692 263.72 79.3031 264.728C88.5316 270.474 92.9978 278.965 92.7727 289.982C92.7135 292.873 92.1567 295.764 91.6946 298.619C91.2326 301.486 90.5574 304.316 90.0361 307.183C87.8682 319.306 90.1427 330.761 95.1775 341.73C98.6723 349.346 103.423 356.124 108.92 362.344C115.909 370.239 124.96 373.847 135.018 375.037C143.31 376.021 151.639 376.143 159.979 375.608C170.499 374.928 180.497 372.098 190.081 367.713C202.07 362.222 213.146 355.116 223.56 346.965C231.9 340.43 240.714 334.891 250.819 331.672C264.502 327.311 277.734 328.392 290.517 334.976C299.781 339.75 307.647 346.443 314.459 354.375C321.342 362.392 328.035 370.592 334.681 378.815C341.469 387.209 348.648 395.19 356.858 402.162C370.02 413.35 384.662 421.586 401.401 425.679C415.238 429.056 429.111 429.263 443.137 427.125C457.59 424.914 470.953 419.8 483.404 412.038C489.233 408.406 495.049 404.762 500.901 401.178C507.891 396.89 514.999 392.797 522.628 389.796C531.952 386.128 541.488 384.221 551.546 385.448C558.832 386.334 565.62 388.655 571.78 392.615C591.789 405.466 603.422 423.906 606.349 447.994C606.905 452.622 607.284 457.262 607.817 461.89C607.924 462.753 608.398 463.567 608.919 465L608.955 464.964ZM185.899 200.846C187.688 200.178 188.896 199.643 190.152 199.267C196.857 197.226 203.539 195.124 210.28 193.217C218.205 190.982 217.02 190.01 225.206 194.529C233.452 199.097 241.886 198.975 250.226 194.59C251.743 193.8 253.247 192.962 254.645 191.978C257.145 190.241 259.633 189.828 262.665 190.703C271.764 193.315 280.957 195.598 290.09 198.064C290.92 198.283 291.654 198.89 292.851 199.546C291.299 200.761 290.185 201.769 288.929 202.571C283.918 205.765 278.493 208.037 272.865 209.774C253.176 215.884 233.132 217.233 212.815 214.22C206.631 213.297 200.577 211.645 194.986 208.657C191.645 206.871 188.399 204.927 185.875 200.834L185.899 200.846Z"
          fill="#ED675D"
        />
      </svg>

      {/* Blur */}
      <div className="absolute inset-0 backdrop-blur-xl" />

      {/* Grain */}
      <Image alt="" src="/grain.png" priority fill />
    </div>
  );
}