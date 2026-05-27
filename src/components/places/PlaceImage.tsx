import { useEffect, useState } from "react";
import type { Place } from "../../types/domain";
import { getGoogleMapsPlacePhoto, type GoogleMapsPhotoResult } from "../../utils/googleMapsPhotos";

type PlaceImageProps = {
  place: Place;
  alt?: string;
  fallbackSrc?: string;
  wrapperClassName?: string;
  imageClassName?: string;
  attributionClassName?: string;
  maxWidthPx?: number;
};

const attributionUri = (uri?: string) => {
  if (!uri) return undefined;
  return uri.startsWith("//") ? `https:${uri}` : uri;
};

export function PlaceImage({
  place,
  alt,
  fallbackSrc,
  wrapperClassName = "block overflow-hidden",
  imageClassName = "size-full object-cover",
  attributionClassName = "absolute bottom-1.5 right-1.5 max-w-[80%] rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold text-white/85 backdrop-blur",
  maxWidthPx = 900
}: PlaceImageProps) {
  const photoKey = `${place.id}:${maxWidthPx}`;
  const [googlePhotoState, setGooglePhotoState] = useState<{ key: string; photo?: GoogleMapsPhotoResult }>();

  useEffect(() => {
    let active = true;

    getGoogleMapsPlacePhoto(place, maxWidthPx).then((photo) => {
      if (active) setGooglePhotoState({ key: photoKey, photo });
    });

    return () => {
      active = false;
    };
  }, [maxWidthPx, photoKey, place]);

  const googlePhoto = googlePhotoState?.key === photoKey ? googlePhotoState.photo : undefined;
  const imageSrc = googlePhoto?.photoUri ?? fallbackSrc ?? place.imageUrl;
  const firstAttribution = googlePhoto?.attributions[0];
  const firstAttributionHref = attributionUri(firstAttribution?.uri);
  const attributionTitle = firstAttribution?.displayName
    ? [`Google Maps photo by ${firstAttribution.displayName}`, firstAttributionHref].filter(Boolean).join(" - ")
    : "Google Maps photo";

  return (
    <span className={`relative ${wrapperClassName}`}>
      <img src={imageSrc} alt={alt ?? place.name} className={imageClassName} />
      {googlePhoto ? (
        firstAttribution?.displayName ? (
          <span className={attributionClassName} title={attributionTitle} aria-label={`Google Maps photo by ${firstAttribution.displayName}`}>
            Photo: {firstAttribution.displayName}
          </span>
        ) : (
          <span className={attributionClassName} title={attributionTitle}>
            Google Maps
          </span>
        )
      ) : null}
    </span>
  );
}
