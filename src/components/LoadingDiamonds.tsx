export function LoadingDiamonds({className=""}:{className?:string}){
 return <svg className={`qgLoadingDiamonds ${className}`.trim()} viewBox="0 0 72 24" aria-hidden="true" focusable="false">
  <path d="M12 12 20 4 28 12 20 20Z"/>
  <path d="M28 12 36 4 44 12 36 20Z"/>
  <path d="M44 12 52 4 60 12 52 20Z"/>
 </svg>;
}
