import React from 'react'
import Paper from '@mui/material/Paper'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import aaltoLogo from '../../../img/logos/Aalto_SCI_EN_13_BLACK_2_cropped.png'
import hyLogo from '../../../img/logos/university-of-helsinki-logo-transparent-black.png'
import heldigLogo from '../../../img/logos/heldig-logo-transparent-black.png'
import universityLvLogo from '../../../img/logos/2024_LU_logotips_ENG_horiz.jpg'
import lumiiMathInstituteLogo from '../../../img/logos/lumii_logo3a.gif'

/**
 * A component for creating a footer. The logos are imported inside this component.
 */
const Footer = props => {
  return (
    <Paper
      sx={theme => ({
        boxShadow: '0 -20px 20px -20px #333',
        borderRadius: 0,
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexWrap: 'wrap',
        rowGap: theme.spacing(2),
        columnGap: theme.spacing(3),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        [theme.breakpoints.down(496)]: {
          paddingTop: theme.spacing(2),
          paddingBottom: theme.spacing(2)
        },
        minHeight: {
          xs: props.layoutConfig.footer.reducedHeight,
          hundredPercentHeight: props.layoutConfig.footer.reducedHeight,
          reducedHeight: props.layoutConfig.footer.defaultHeight
        }
      })}
    >
      <Box
        component='a'
        href='https://www.aalto.fi/en/school-of-science'
        target='_blank'
        rel='noopener noreferrer'
        sx={theme => ({
          width: 143,
          height: 29,
          [theme.breakpoints.up(props.layoutConfig.reducedHeightBreakpoint)]: {
            width: 167,
            height: 34
          }
        })}
      >
        <Box
          component='img'
          src={aaltoLogo}
          alt='Aalto University logo'
          sx={{
            height: '100%'
          }}
        />
      </Box>
      <Box
        component='a'
        href='https://www.helsinki.fi/en'
        target='_blank'
        rel='noopener noreferrer'
        sx={theme => ({
          width: 155,
          height: 40,
          [theme.breakpoints.up(props.layoutConfig.reducedHeightBreakpoint)]: {
            width: 168,
            height: 45
          }
        })}
      >
        <Box
          component='img'
          src={hyLogo}
          alt='University of Helsinki logo'
          sx={{
            height: '100%'
          }}
        />
      </Box>
      <Box
        component='a'
        href='https://www.helsinki.fi/en/helsinki-centre-for-digital-humanities'
        target='_blank'
        rel='noopener noreferrer'
        sx={theme => ({
          width: 118,
          height: 30,
          [theme.breakpoints.up(props.layoutConfig.reducedHeightBreakpoint)]: {
            width: 130,
            height: 33
          }
        })}
      >
        <Box
          component='img'
          src={heldigLogo}
          alt='University of Latvia'
          sx={{
            height: '100%'
          }}
        />
      </Box>
      <Box
        component='a'
        href='https://www.lu.lv/en/'
        target='_blank'
        rel='noopener noreferrer'
        sx={theme => ({
          width: 91,
          height: 40,
          [theme.breakpoints.up(props.layoutConfig.reducedHeightBreakpoint)]: {
            width: 105,
            height: 46
          }
        })}
      >
        <Box
          component='img'
          src={universityLvLogo}
          alt='University of Latvia logo'
          sx={{
            height: '100%'
          }}
        />
      </Box>
      <Box
        component='a'
        href='https://www.lumii.lv/'
        target='_blank'
        rel='noopener noreferrer'
        sx={theme => ({
          width: 229,
          height: 30,
          [theme.breakpoints.up(props.layoutConfig.reducedHeightBreakpoint)]: {
            width: 235,
            height: 34
          }
        })}
      >
        <Box
          component='img'
          src={lumiiMathInstituteLogo}
          alt='LUMII logo'
          sx={{
            height: '100%'
          }}
        />
      </Box>
    </Paper>
  )
}

Footer.propTypes = {
  layoutConfig: PropTypes.object.isRequired
}

export default Footer
