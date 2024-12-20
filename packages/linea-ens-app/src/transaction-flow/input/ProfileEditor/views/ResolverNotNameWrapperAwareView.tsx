import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { Button, Dialog } from '@ensdomains/thorin'

import { Outlink } from '@app/components/Outlink'
import { getSupportLink } from '@app/utils/supportLinks'

import { CenteredTypography } from '../components/CenteredTypography'
import { ContentContainer } from '../components/ContentContainer'
import { DetailedSwitch } from '../components/DetailedSwitch'
import { StyledInnerDialog } from '../components/StyledInnerDialog'
import type { SelectedProfile } from '../ResolverWarningOverlay'

type Props = {
  selected: SelectedProfile
  hasProfile: boolean
  onChangeSelected: (selected: SelectedProfile) => void
  onCancel: () => void
  onNext: () => void
}
export const ResolverNotNameWrapperAwareView = ({
  selected,
  hasProfile,
  onChangeSelected,
  onNext,
  onCancel,
}: Props) => {
  const theme = useTheme()
  const { t } = useTranslation('transactionFlow')
  return (
    <>
      <Dialog.Heading
        title={t('input.profileEditor.warningOverlay.resolverNotNameWrapperAware.title')}
        alert="error"
      />
      <StyledInnerDialog>
        <ContentContainer>
          <CenteredTypography>
            {t('input.profileEditor.warningOverlay.resolverNotNameWrapperAware.subtitle')}
          </CenteredTypography>
          <Outlink href={getSupportLink('resolver')}>
            {t('input.profileEditor.warningOverlay.action.learnMoreResolvers')}
          </Outlink>
        </ContentContainer>
        {hasProfile && (
          <DetailedSwitch
            title={t('input.profileEditor.warningOverlay.resolverNotNameWrapperAware.toggle.title')}
            description={t(
              'input.profileEditor.warningOverlay.resolverNotNameWrapperAware.toggle.subtitle',
            )}
            checked={selected !== 'reset'}
            onChange={(e) => onChangeSelected(e.target.checked ? 'latest' : 'reset')}
          />
        )}
      </StyledInnerDialog>
      <Dialog.Footer
        leading={
          <Button
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              color: theme.colors.textSecondary,
            }}
            onClick={onCancel}
            data-testid="warning-overlay-back-button"
          >
            {t('action.cancel', { ns: 'common' })}
          </Button>
        }
        trailing={
          <Button onClick={onNext} data-testid="warning-overlay-next-button">
            {t('input.profileEditor.warningOverlay.action.updateResolver')}
          </Button>
        }
      />
    </>
  )
}
